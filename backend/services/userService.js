const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/authMiddleware");

class UserService {
  async getAllUsers(filters = {}) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }

    return await User.find(query).sort({ createdAt: -1 });
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).select("+password");
  }

  async getUserByUsername(username) {
    return await User.findOne({ username }).select("+password");
  }

  async createUser(data) {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      class: className,
    } = data;

    // Validation
    if (!username || !email || !password || !confirmPassword || !role) {
      throw new Error(
        "جميع الحقول مطلوبة: اسم المستخدم، البريد الإلكتروني، كلمة المرور، تأكيد كلمة المرور، الدور",
      );
    }

    if (password.length < 6) {
      throw new Error("يجب أن تكون كلمة المرور بطول 6 أحرف على الأقل");
    }

    if (password !== confirmPassword) {
      throw new Error("كلمات المرور غير متطابقة");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("دور غير صحيح. يجب أن يكون أحد: مسؤول، مشغل، معلم");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("البريد الإلكتروني مسجل بالفعل");
      }
      if (existingUser.username === username) {
        throw new Error("اسم المستخدم مأخوذ بالفعل");
      }
    }

    // Store plain text password before hashing
    const plainTextPassword = password;

    // Create user
    const user = new User({
      username,
      email,
      password,
      role,
      class: role === "teacher" && className ? className : null,
    });

    await user.save();

    // Return user with plain text password included (only for creation)
    const userObj = user.toJSON();
    return {
      ...userObj,
      plainTextPassword: plainTextPassword,
    };
  }

  async updateUser(id, data) {
    const {
      username,
      email,
      password,
      confirmPassword,
      role,
      class: className,
    } = data;
    const user = await User.findById(id).select("+password");

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // Check if trying to change last admin's role to something else
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new Error(
          "لا يمكن تغيير دور آخر مسؤول. يجب أن يكون هناك مسؤول واحد على الأقل في النظام",
        );
      }
    }

    // Validation
    if (!username || !email || !role) {
      throw new Error("اسم المستخدم والبريد الإلكتروني والدور مطلوبة");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("دور غير صحيح. يجب أن يكون أحد: مسؤول، مشغل، معلم");
    }

    // If password is provided, validate it
    if (password) {
      if (password.length < 6) {
        throw new Error("يجب أن تكون كلمة المرور بطول 6 أحرف على الأقل");
      }
      if (password !== confirmPassword) {
        throw new Error("كلمات المرور غير متطابقة");
      }
    }

    // Check if email or username is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("البريد الإلكتروني مسجل بالفعل");
      }
      if (existingUser.username === username) {
        throw new Error("اسم المستخدم مأخوذ بالفعل");
      }
    }

    // Update user
    user.username = username;
    user.email = email;
    user.role = role;
    user.class = role === "teacher" && className ? className : null;

    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();
    return user.toJSON();
  }

  async canDeleteUser(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // If user is admin, check if there are other admins
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new Error(
          "لا يمكن حذف آخر مسؤول. يجب أن يكون هناك مسؤول واحد على الأقل في النظام",
        );
      }
    }

    return true;
  }

  async deleteUser(id) {
    // Check if user can be deleted
    await this.canDeleteUser(id);

    const user = await User.findById(id);

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    await User.findByIdAndDelete(id);
    return { message: "تم حذف المستخدم بنجاح" };
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    user.isActive = !user.isActive;
    await user.save();
    return user.toJSON();
  }

  // Authentication methods
  async login(username, password) {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select("+password");

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("كلمة المرور غير صحيحة");
    }

    if (!user.isActive) {
      throw new Error("حساب المستخدم معطل");
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    return {
      token,
      user: user.toJSON(),
    };
  }

  async changePassword(id, currentPassword, newPassword, confirmNewPassword) {
    const user = await User.findById(id).select("+password");

    if (!user) {
      throw new Error("المستخدم غير موجود");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error("كلمة المرور الحالية غير صحيحة");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("يجب أن تكون كلمة المرور الجديدة بطول 6 أحرف على الأقل");
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error("كلمات المرور الجديدة غير متطابقة");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("رمز غير صحيح");
    }
  }
}

module.exports = new UserService();

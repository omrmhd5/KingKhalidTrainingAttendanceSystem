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
        "errors.allFieldsRequired",
      );
    }

    if (password.length < 6) {
      throw new Error("errors.passwordMin");
    }

    if (password !== confirmPassword) {
      throw new Error("errors.passwordMismatch");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("errors.invalidRole");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("errors.emailTaken");
      }
      if (existingUser.username === username) {
        throw new Error("errors.usernameTaken");
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
      throw new Error("errors.userNotFound");
    }

    // Check if trying to change last admin's role to something else
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new Error(
          "errors.lastAdmin",
        );
      }
    }

    // Validation
    if (!username || !email || !role) {
      throw new Error("errors.usernameEmailRoleRequired");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("errors.invalidRole");
    }

    // If password is provided, validate it
    if (password) {
      if (password.length < 6) {
        throw new Error("errors.passwordMin");
      }
      if (password !== confirmPassword) {
        throw new Error("errors.passwordMismatch");
      }
    }

    // Check if email or username is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("errors.emailTaken");
      }
      if (existingUser.username === username) {
        throw new Error("errors.usernameTaken");
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
      throw new Error("errors.userNotFound");
    }

    // If user is admin, check if there are other admins
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        throw new Error(
          "errors.lastAdmin",
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
      throw new Error("errors.userNotFound");
    }

    await User.findByIdAndDelete(id);
    return { message: "success.userDeleted" };
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("errors.userNotFound");
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
      throw new Error("errors.userNotFound");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("errors.invalidPassword");
    }

    if (!user.isActive) {
      throw new Error("errors.accountDisabled");
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
      throw new Error("errors.userNotFound");
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new Error("errors.currentPasswordWrong");
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error("errors.newPasswordMin");
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error("errors.newPasswordMismatch");
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();
  }

  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("errors.invalidCode");
    }
  }
}

module.exports = new UserService();

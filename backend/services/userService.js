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
        "All fields required: username, email, password, confirmPassword, role",
      );
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("Invalid role. Must be one of: admin, operator, teacher");
    }

    if (role === "teacher" && !className) {
      throw new Error("Class is required for teacher role");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email already registered");
      }
      if (existingUser.username === username) {
        throw new Error("Username already taken");
      }
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      role,
      class: role === "teacher" ? className : undefined,
    });

    await user.save();
    return user.toJSON();
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
      throw new Error("User not found");
    }

    // Validation
    if (!username || !email || !role) {
      throw new Error("Username, email, and role are required");
    }

    if (!["admin", "operator", "teacher"].includes(role)) {
      throw new Error("Invalid role. Must be one of: admin, operator, teacher");
    }

    if (role === "teacher" && !className) {
      throw new Error("Class is required for teacher role");
    }

    // If password is provided, validate it
    if (password) {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
    }

    // Check if email or username is already taken by another user
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new Error("Email already registered");
      }
      if (existingUser.username === username) {
        throw new Error("Username already taken");
      }
    }

    // Update user
    user.username = username;
    user.email = email;
    user.role = role;
    user.class = role === "teacher" ? className : undefined;

    if (password) {
      user.password = password; // Will be hashed by pre-save hook
    }

    await user.save();
    return user.toJSON();
  }

  async deleteUser(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    await User.findByIdAndDelete(id);
    return { message: "User deleted successfully" };
  }

  async toggleUserStatus(id) {
    const user = await User.findById(id);

    if (!user) {
      throw new Error("User not found");
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
      throw new Error("User not found");
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    if (!user.isActive) {
      throw new Error("User account is deactivated");
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

  async verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

module.exports = new UserService();

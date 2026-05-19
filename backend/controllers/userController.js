const userService = require("../services/userService");
const classService = require("../services/classService");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const filters = {
      role: req.query.role,
      isActive:
        req.query.isActive !== undefined
          ? req.query.isActive === "true"
          : undefined,
    };
    const users = await userService.getAllUsers(filters);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    const { plainTextPassword, ...user } = result;

    // If teacher role and class provided, assign teacher to class
    if (user.role === "teacher" && req.body.class) {
      try {
        await classService.assignTeacherToClass(user._id, req.body.class);
      } catch (classError) {
        console.error("Failed to assign teacher to class:", classError.message);
        // Don't fail the user creation if class assignment fails
      }
    }

    res.status(201).json({
      message: "User created successfully",
      user,
      plainTextPassword,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const oldUser = await userService.getUserById(req.params.id);
    const user = await userService.updateUser(req.params.id, req.body);

    // Handle class assignment for teachers
    if (user.role === "teacher" && req.body.class) {
      try {
        // assignTeacherToClass handles moving from old class to new class
        await classService.assignTeacherToClass(user._id, req.body.class);
      } catch (classError) {
        console.error("Failed to update class assignment:", classError.message);
      }
    }

    // If teacher's class was removed, unassign from old class
    if (
      user.role === "teacher" &&
      !req.body.class &&
      oldUser &&
      oldUser.class
    ) {
      try {
        await classService.unassignTeacherFromClass(oldUser.class);
      } catch (classError) {
        console.error(
          "Failed to unassign teacher from class:",
          classError.message,
        );
      }
    }

    res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    // If teacher, unassign from class
    if (user && user.role === "teacher" && user.class) {
      try {
        await classService.unassignTeacherFromClass(user.class);
      } catch (classError) {
        console.error(
          "Failed to unassign teacher from class:",
          classError.message,
        );
      }
    }

    await userService.deleteUser(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Toggle user status (activate/deactivate)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Change own password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: "جميع حقول كلمة المرور مطلوبة" });
    }
    await userService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword,
      confirmNewPassword,
    );
    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const { token, user } = await userService.login(username, password);

    // Set token in httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Must be false for HTTP local networks
      sameSite: "lax", // Lax is perfect because the frontend and backend share the same IP
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Logout user
exports.logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ message: "Logout successful" });
};

// Get current user (from token)
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

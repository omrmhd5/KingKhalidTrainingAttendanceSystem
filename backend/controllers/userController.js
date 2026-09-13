const userService = require("../services/userService");
const classService = require("../services/classService");
const { t } = require("../lib/i18n");
const { sendError, sendCaught, cookieOpts } = require("../lib/http");

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
    sendCaught(req, res, error, 500);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) {
      return sendError(req, res, 404, "errors.userNotFound");
    }
    res.json(user);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.createUser = async (req, res) => {
  try {
    const result = await userService.createUser(req.body);
    const { plainTextPassword, ...user } = result;

    if (user.role === "teacher" && req.body.class) {
      try {
        await classService.assignTeacherToClass(user._id, req.body.class);
      } catch (classError) {
        console.error("Failed to assign teacher to class:", classError.message);
      }
    }

    res.status(201).json({
      message: t(req, "success.userCreated"),
      user,
      plainTextPassword,
    });
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const oldUser = await userService.getUserById(req.params.id);
    const user = await userService.updateUser(req.params.id, req.body);

    if (user.role === "teacher" && req.body.class) {
      try {
        await classService.assignTeacherToClass(user._id, req.body.class);
      } catch (classError) {
        console.error("Failed to update class assignment:", classError.message);
      }
    }

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
      message: t(req, "success.userUpdated"),
      user,
    });
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

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
    res.json({ message: t(req, "success.userDeleted") });
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await userService.toggleUserStatus(req.params.id);
    res.json({
      message: t(
        req,
        user.isActive ? "success.userActivated" : "success.userDeactivated",
      ),
      user,
    });
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return sendError(req, res, 400, "errors.passwordFieldsRequired");
    }
    await userService.changePassword(
      req.user.userId,
      currentPassword,
      newPassword,
      confirmNewPassword,
    );
    res.json({ message: t(req, "success.passwordChanged") });
  } catch (error) {
    sendCaught(req, res, error, 400);
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return sendError(req, res, 400, "errors.usernamePasswordRequired");
    }

    const { token, user } = await userService.login(username, password);

    res.cookie("token", token, cookieOpts());

    res.json({
      message: t(req, "success.login"),
      token,
      user,
    });
  } catch (error) {
    sendCaught(req, res, error, 401);
  }
};

exports.logout = async (req, res) => {
  res.clearCookie("token", cookieOpts());
  res.json({ message: t(req, "success.logout") });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    if (!user) {
      return sendError(req, res, 404, "errors.userNotFound");
    }
    res.json(user);
  } catch (error) {
    sendCaught(req, res, error, 500);
  }
};

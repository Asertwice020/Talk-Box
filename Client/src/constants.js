const userRoutes = {
  register: "http://localhost:4500/api/v1/users/register",
  login: "http://localhost:4500/api/v1/users/login",
  logout: "http://localhost:4500/api/v1/users/logout",
  changeAvatar: "http://localhost:4500/api/v1/users/change-avatar",
};

const colorCodes = {
  avatarDefault: "#6A7175",
};

const constantValues = {
  DEFAULT_AVATAR:
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
};

export { constantValues, userRoutes, colorCodes };
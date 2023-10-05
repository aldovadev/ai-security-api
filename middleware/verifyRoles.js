const verifyRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req?.user_role)
      return res.status(401).send({ message: "Unauthorized access!" });

    const rolesArray = [...allowedRoles];

    let result = false;

    for (let data of rolesArray) {
      if (data === req.user_role) {
        result = true;
        break;
      }
    }

    if (!result)
      return res.status(401).send({ message: "Unauthorized access!" });
    next();
  };
};

export default verifyRoles;

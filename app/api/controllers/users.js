const userModel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  create: async function (req, res, next) {
    const { name, email, password } = req.body;

    try {
      const existingUser = await userModel.findOne({ email });

      //console.log(existingUser)

      if (existingUser)
        return res.status(400).json({ message: "User already exist." });

      const result = await userModel.create({
        name: name,
        email: email,
        password: password,
      });

      res.status(200).json({
        status: "success",
        message: "User added successfully!!!",
        data: null,
      });
    } catch (error) {
      next(error);
    }
  },

  authenticate: async function (req, res, next) {
    try {
      //console.log(req)
      const result = await userModel.findOne({ email: req.body.email });

      //console.log(result);

      if (bcrypt.compareSync(req.body.password, result.password)) {
        const token = jwt.sign({ id: result._id }, req.app.get("secretKey"), {
          expiresIn: "1h",
        });
        return res.json({
          status: "success",
          message: "user found!!!",
          data: { user: result, token: token },
        });
      } else {
        return res.json({
          status: "error",
          message: "Invalid email/password!!!",
          data: null,
        });
      }
    } catch (error) {
      next(error);
    }
  },
};

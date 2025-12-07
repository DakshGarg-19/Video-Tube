import * as yup from "yup";

export const signupSchema = yup.object({
  username: yup
    .string()
    .trim()
    .lowercase()
    .min(3, "Username must be at lest 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .required("Username is required"),

  email: yup
    .string()
    .trim()
    .email("Invalid email")
    .required("Email is required."),

  fullname: yup
    .string()
    .trim()
    .min(3, "Fullname must be at lest 3 characters")
    .required("Fullname is required"),

  password: yup
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
});

export const loginSchema = yup
  .object({
    username: yup
      .string()
      .trim()
      .lowercase()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters")
      .nullable()
      .notRequired(),

    email: yup.string().trim().email("Invalid email").nullable().notRequired(),

    password: yup
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters long")
      .required("Password is required"),
  })
  .test(
    "username-or-email",
    "Either username or email is required",
    function (value) {
      const { username, email } = value;
      return !!(username || email);
    }
  );

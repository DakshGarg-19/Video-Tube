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
    .required("Email is required"),

  fullname: yup
    .string()
    .trim()
    .min(3, "Fullname must be at lest 3 characters")
    .max(30, "Fullname cannot exceed 30 characters")
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

    email: yup.string().trim().email("Invalid email address").nullable().notRequired(),

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

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required("Current password is required")
    .min(8, "Invalid current password"),

  newPassword: yup
    .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    // .matches(
    //   PASSWORD_REGEX,
    //   "Password must contain uppercase, lowercase, number and special character"
    // )
    .notOneOf(
      [yup.ref("currentPassword")],
      "New password must be different from current password"
    ),

  confirmPassword: yup
    .string()
    .required("Please confirm your new password")
    .oneOf([yup.ref("newPassword")], "Passwords does not match"),
});

export const updateUserSchema = yup
  .object({
    username: yup
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters"),

    email: yup.string().trim().email("Invalid email address"),

    fullname: yup
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(30, "Full name cannot exceed 30 characters"),
  })
  .test(
    "at-least-one-field",
    "At least one field must be provided",
    (value) => {
      return value && (value.username || value.email || value.fullname);
    }
  );

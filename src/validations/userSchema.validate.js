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
    .min(3, "Username must be at lest 3 characters")
    .required("is required"),

  password: yup
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .required("Password is required"),
});

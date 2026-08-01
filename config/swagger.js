const swaggerJsdoc = require("swagger-jsdoc");

// Swagger/OpenAPI configuration — reads the @swagger JSDoc comments
// above each route definition in routes/*.js and builds the spec
// served at /api-docs.
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Study Buddy Finder API",
      version: "1.0.0",
      description:
        "REST API for StudyBuddy NCI — lets National College of Ireland students " +
        "register, manage their profile, find and connect with study buddies, " +
        "schedule study sessions, and manage account settings.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local development server",
      },
    ],
    tags: [
      { name: "Authentication", description: "Register, log in/out, and password reset" },
      { name: "Profile", description: "View, search, and update student profiles" },
      { name: "Connections", description: "Study buddy connection requests and dashboard data" },
      { name: "Sessions", description: "Study session proposals and scheduling" },
      { name: "Settings", description: "Theme and notification preferences" },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description:
            "Session cookie set after a successful POST /api/auth/login. " +
            "Most endpoints require this to be present.",
        },
      },
    },
  },
  // Where to look for @swagger JSDoc comments
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

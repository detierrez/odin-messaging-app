module.exports.toSorted = (array) => {
  return array.toSorted((a, b) => a - b);
};

module.exports.toScreamingSnakeCase = (str) => {
  return (
    str
      // Remove non-word characters and replace spaces/hyphens with underscores
      .replace(/[^a-zA-Z0-9]/g, "_")
      // Insert underscore before camelCase or PascalCase changes
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      // Remove extra/duplicate underscores
      .replace(/_+/g, "_")
      .toUpperCase()
  );
};

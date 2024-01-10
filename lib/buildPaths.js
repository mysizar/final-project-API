export default function buildPaths(object, previousPath) {
  const obj = {};

  /* This recursive function loops through the object and creates paths for updating nested objects. This is necessary to update ONLY the keys that are in req.body and AVOID deleting all other keys from the DB collection. */

  function getPath(object, previousPath) {
    for (const key in object) {
      const currentPath = previousPath ? `${previousPath}.${key}` : key;

      if (Array.isArray(object[key])) {
        getPath(object[key], currentPath);
      } else if (typeof object[key] === "object") {
        getPath(object[key], currentPath);
      } else {
        obj[currentPath] = object[key];
      }
    }
  }

  getPath(object, previousPath);
  return obj;
}

import _ from "lodash";

export function cloneWithMaxDepth<T>(obj: T, maxDepth: number): T {
  let currentDepth = 0;
  
  return _.cloneDeepWith(obj, (value) => {
    if (_.isObject(value)) {
      currentDepth++;
      if (currentDepth > maxDepth) {
        return value; // Stop cloning at max depth and just return reference
      }
    }
    return undefined; // Continue normal cloning
  });
}

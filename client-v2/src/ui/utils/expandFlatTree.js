export default function expandFlatTree(flattened, delimiter = '/') {
    if (Array.isArray(flattened)) {
        flattened = flattened.reduce((map, path) => {
            map[path] = path;

            return map;
        }, {});
    }

    return Object.keys(flattened).reduce((expanded, path) => {
        const segments = path.split(delimiter);
        const filename = segments.pop();
        const parent = segments.reduce((parent, segment) => parent[segment] || (parent[segment] = {}), expanded);

        parent[filename] = flattened[path];

        return expanded;
    }, {});
}

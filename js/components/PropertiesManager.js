let properties = new WeakMap();

class PropertiesManager {
	get(object) {
		let map = properties.get(object);
		if (map === undefined) {
			map = {};
			properties.set(object, map);
		}
		return map;
	}

	update(object, key, value) {
		properties.get(object)[key] = value;
	}
}

export { PropertiesManager };

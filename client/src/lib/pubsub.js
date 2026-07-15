export default class Pubsub {
  _topics = new Map();

  subscribe(topic, handle) {
    const handlers =
      this._topics.get(topic) ?? this._topics.set(topic, new Set()).get(topic);
    handlers.add(handle);
    const unsubscribe = () => {
      handlers.delete(handle);
      if (handlers.size === 0) {
        this._topics.delete(topic);
      }
    };

    return unsubscribe;
  }

  publish(topic, data) {
    const handlers = this._topics.get(topic) ?? [];
    handlers.forEach((handle) => handle(data));
  }
}

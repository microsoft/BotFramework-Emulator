export class WindowHostReceiver {
  constructor(collapsibleJson, host) {
    this.collapsibleJson = collapsibleJson;
    this.host = host;
    this.startListening();
  }
  startListening() {
    if (!this.host) {
      return;
    }
    this.host.on('inspect', this.onInspect.bind(this));
    this.host.on('theme', this.onTheme.bind(this));
    this.host.on('accessory-click', this.onAccessoryClick.bind(this));
  }
  onInspect(data) {
    const { collapsibleJson } = this;
    collapsibleJson.json = data;
  }
  async onTheme(themeInfo) {
    const oldThemeComponents = document.querySelectorAll('[data-theme-component="true"]');
    const head = document.querySelector('head');
    const fragment = document.createDocumentFragment();
    const promises = [];
    // Create the new links for each theme component
    themeInfo.themeComponents.forEach(themeComponent => {
      const link = document.createElement('link');
      promises.push(
        new Promise(resolve => {
          link.addEventListener('load', resolve);
        })
      );
      link.href = themeComponent;
      link.rel = 'stylesheet';
      link.setAttribute('data-theme-component', 'true');
      fragment.appendChild(link);
    });
    head.insertBefore(fragment, head.firstElementChild);
    // Wait for all the links to load their css
    await Promise.all(promises);
    // Remove the old links
    oldThemeComponents.forEach(themeComponent => {
      if (themeComponent.parentElement) {
        themeComponent.parentElement.removeChild(themeComponent);
      }
    });
  }
  onAccessoryClick(_id) {
    // stub for immediate future use
  }
}

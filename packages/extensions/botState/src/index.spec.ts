import { BotState, BotStateVisualizer } from './BotStateVisualizer';

(window as any).host = {
  bot: {},
  handlers: {
    'accessory-click': [],
    'bot-updated': [],
    inspect: [],
    theme: [],
  },

  on: function(event, handler) {
    if (handler && Array.isArray(this.handlers[event]) && !this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
    return () => {
      this.handlers[event] = this.handlers[event].filter(item => item !== handler);
    };
  },
};

const botState: BotState = {
  conversationState: {
    memory: {
      id: 12,
      value: 'bot',
    },
  },
  userState: {
    memory: {
      value: 'greetings!',
      dialogStack: ['test', 'test1', 'test2'],
    },
  },
};

describe('The BotStateVisualizer', () => {
  let svg;
  beforeAll(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'bot-state-visualizer';
    document.body.appendChild(svg);
  });

  it('should render with data', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.inspect.forEach(callback => callback({ valueType: '', value: botState }));
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['dark.css'] }));
    expect(svg.children[0].children.length).toBe(2);
  });

  it('should re-render when the window resizes', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.inspect.forEach(callback => callback({ valueType: '', value: botState }));
    const spy = jest.spyOn(visualizer, 'renderTree');
    window.dispatchEvent(new Event('resize'));
    expect(spy).toHaveBeenCalled();
  });

  it('should switch themes', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['light.css'] }));
    let link: HTMLLinkElement = document.querySelector('[data-theme-component="true"]');
    expect(link.href).toBe('http://localhost/light.css');
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['dark.css'] }));
    link = document.querySelector('[data-theme-component="true"]');
    expect(link.href).toBe('http://localhost/dark.css');
  });
});

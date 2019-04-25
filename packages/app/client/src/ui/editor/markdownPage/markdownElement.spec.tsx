import { mount, ReactWrapper } from 'enzyme';
import { WelcomePage } from '../welcomePage/welcomePage';
import * as React from 'react';
import { MarkdownPage, MarkdownPageProps } from './markdownPage';

describe('The Markdown page', () => {
  let parent: ReactWrapper;
  let instance: WelcomePage;
  const render = (props: MarkdownPageProps) => {
    parent = mount<MarkdownPage>(<MarkdownPage {...props} />);
    instance = parent.instance() as WelcomePage;
  };

  it('should render markdown when the user is online', () => {
    render({ onLine: true, markdown: '# markdown!' });
    const divHtml = parent.html();
    expect(divHtml).toBe('<div class="undefined "><div><div><h1>markdown!</h1>\n</div></div></div>');
  });

  it('should render offline content when the user is offline', () => {
    render({ onLine: false, markdown: '' });
    const divHtml = parent.html();
    expect(divHtml).toBe(
      '<div class="undefined "><div><div><h1>No Internet Connection</h1>try:<ul><li>Checking the network cables, model or router</li><li>Reconnecting to Wi-Fi</li></ul></div></div></div>'
    );
  });

  it('should not update unless the props have changed and have different values', () => {
    render({ onLine: true, markdown: '# markdown!' });
    const props = { ...instance.props };
    expect(instance.shouldComponentUpdate(props, {}, {})).toBe(false);
  });

  it('should render the "invalid markdown" message when invalid markdown is provided', () => {
    render({ onLine: true, markdown: [] as any });
    const divHtml = parent.html();
    expect(divHtml).toBe('<div class="undefined "><div><div># Error - Invalid markdown document</div></div></div>');
  });
});

import messages from './messages';

export default class {
  static test = '';

  renderInfo = async () => {
    await import('test');
    return (
      <div>{formatMessage(messages.baz)}</div>
    );
  };

  render() {
    const { text } = this.props;
    return (
      <div>
        {this.renderInfo()}
        <FormattedMessage {...messages.foo} />
        {text && (
          <div>
            {intl.formatMessage(messages.bar)}
          </div>
        )}
      </div>
    );
  }
}

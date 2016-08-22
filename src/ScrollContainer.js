import React from 'react';
import ReactDOM from 'react-dom';
import warning from 'warning';

const propTypes = {
  scrollKey: React.PropTypes.string.isRequired,
  shouldUpdateScroll: React.PropTypes.func,
  children: React.PropTypes.element.isRequired,
};

const contextTypes = {
  // This is necessary when rendering on the client. However, when rendering on
  // the server, this container will do nothing, and thus does not require the
  // scroll behavior context.
  scrollBehavior: React.PropTypes.object,
};

class ScrollContainer extends React.Component {
  constructor(props, context) {
    super(props, context);

    // We don't re-register if the scroll key changes, so make sure we
    // unregister with the initial scroll key just in case the user changes it.
    this.scrollKey = props.scrollKey;
  }

  componentDidMount() {
    this.context.scrollBehavior.registerElement(
      this.props.scrollKey,
      ReactDOM.findDOMNode(this),
      this.shouldUpdateScroll
    );

    // Only keep around the current DOM node in development, as this is only
    // for emitting the appropriate warning.
    if (__DEV__) {
      this.domNode = ReactDOM.findDOMNode(this);
    }
  }

  componentWillReceiveProps(nextProps) {
    warning(
      nextProps.scrollKey === this.props.scrollKey,
      'ScrollContainer: <ScrollContainer> does not support changing scrollKey.'
    );
  }

  componentDidUpdate() {
    if (__DEV__) {
      const prevDomNode = this.domNode;
      this.domNode = ReactDOM.findDOMNode(this);

      warning(
        this.domNode === prevDomNode,
        'ScrollContainer: <ScrollContainer> does not support changing DOM ' +
        'node.'
      );
    }
  }

  componentWillUnmount() {
    this.context.scrollBehavior.unregisterElement(this.scrollKey);
  }

  shouldUpdateScroll = (prevRouterProps, routerProps) => {
    const { shouldUpdateScroll } = this.props;
    if (!shouldUpdateScroll) {
      return true;
    }

    // Hack to allow accessing scrollBehavior.readPosition().
    return shouldUpdateScroll.call(
      this.context.scrollBehavior.scrollBehavior,
      prevRouterProps,
      routerProps
    );
  };

  render() {
    return this.props.children;
  }
}

ScrollContainer.propTypes = propTypes;
ScrollContainer.contextTypes = contextTypes;

export default ScrollContainer;
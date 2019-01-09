// @flow
import React, { Component } from 'react'
import {
  PanResponder,
  View,
}                           from 'react-native'
import rebound              from 'rebound'
import styled               from 'styled-components/native'

import PagerIndicator       from './PagerIndicator'

const Container = styled.View`
  flex-direction: column;
  overflow: hidden;
`
const ScrollPanel = styled.View`
  flex: 1;
  flex-direction: row;
  ${({ width }) => width && `
    width: ${width};
  `}
  ${({style}) => style && `
    ${style}
  `}
`
const Slide = styled.View`
  ${({ width, height }) => width && height && `
    width: ${width};
    height: ${height};
  `}
`
const ArrowsOverlay = styled.View`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50%;
  top: 50%;
  background-color: transparent;
  ${({style}) => style && `
    ${style}
  `}
`
const ArrowsRow = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${({style}) => style && `
    ${style}
  `}
`
const ArrowButton = styled.TouchableOpacity`
  opacity: ${props => (props.hidden ? 0 : 100)}
  ${({style}) => style && `
    ${style}
  `}
`
const ArrowImage = styled.Image`
  width: 60px;
  height: 60px;
  margin: 0 40px;
  ${({style}) => style && `
    ${style}
  `}
`
let timer = null;

class Carousel extends Component {
  panResponder = {};
  previousLeft = 0;
  previousPage = 0;
  released = true;
  scrollSpring = null;
  springSystem = null;

  state = {
    currentPage: 1,
    width: 0,
    height: 0,
  };

  componentWillMount() {
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onPanResponderMove: this.onPanResponderMove,
      onPanResponderRelease: this.onPanResponderEnd,
      onPanResponderTerminate: this.onPanResponderEnd,
    });

    this.springSystem = new rebound.SpringSystem();
    this.scrollSpring = this.springSystem.createSpring();
    const springConfig = this.scrollSpring.getSpringConfig();
    springConfig.tension = 110;
    springConfig.friction = 30;

    this.scrollSpring.addListener({
      onSpringUpdate: this.onSpringUpdate,
      onSpringEndStateChange: this.onSpringEndStateChange,
    });

    if (this.props.speed) {
      timer = setTimeout(() => {
        const currentPage = -1;
        this.scrollSpring.setCurrentValue((currentPage + 1) * this.state.width);
        this.released = true;
        this.movePage(currentPage, false);
      }, this.props.speed);
    }
  }

  componentWillUnmount() {
    this.scrollSpring.removeAllListeners();
    if (timer) {
      clearTimeout(timer);
    }
  }

  onSpringUpdate = () => {
    if (this.released) {
      this.previousLeft = this.scrollSpring.getCurrentValue();
      this.scrollPanel.setNativeProps({
        style: {
          left: this.scrollSpring.getCurrentValue(),
        },
      });
    }
  }

  onSpringEndStateChange = () => {
    if (this.props.speed) {
      timer = setTimeout(() => {
        let currentPage = Math.floor((this.previousLeft + this.state.width / 2) / this.state.width);
        currentPage -= 1;

        if (currentPage < this.props.children.length * -1) {
          currentPage = -1;
          this.scrollSpring.setCurrentValue((currentPage + 1) * this.state.width);
        }

        this.movePage(currentPage, false);
      }, this.props.speed);
    }
  }

  onStartShouldSetPanResponder = () => {
    if (timer) {
      clearTimeout(timer);
    }

    return true;
  }

  onPanResponderMove = (event: Object, gestureState: Object) => {
    if (timer) {
      clearTimeout(timer);
    }

    this.released = false;

    if (gestureState.dx + this.previousLeft < -1 * (this.state.width * this.props.children.length)) {
      this.previousLeft = gestureState.dx * -1;
    }

    if (gestureState.dx + this.previousLeft > 0) {
      this.previousLeft = this.state.width *- this.props.children.length - gestureState.dx;
    }

    this.scrollPanel.setNativeProps({
      style: {
        left: gestureState.dx + this.previousLeft,
      },
    });

    this.scrollSpring.setCurrentValue(gestureState.dx + this.previousLeft);
  }

  onPanResponderEnd = (event: Object, gestureState: Object) => {
    this.released = true;
    this.previousLeft += gestureState.dx;
    let currentPage = Math.floor((this.previousLeft + this.state.width / 2) / this.state.width);

    if (currentPage === this.previousPage) {
      if (gestureState.dx > 50) {
        currentPage += 1;
      } else if (gestureState.dx < -50) {
        currentPage -= 1;
      } else {
        let realCurrentPage = (currentPage * -1 +1) % (this.props.children.length + 1);
        if (realCurrentPage === 0) {
          realCurrentPage = 1;
        }

        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          if (this.props.onPress) {
            this.props.onPress(realCurrentPage);
          }
        }
      }
    }

    this.movePage(currentPage, true);
  }

  movePage(currentPage: number, manualChange: boolean) {
    this.previousPage = currentPage;
    this.scrollSpring.setEndValue(currentPage * this.state.width);

    this.currentPage = currentPage * -1 +1;


    if (this.currentPage > this.props.children.length) {
      this.currentPage = 1;
    }

    this.setState({ currentPage: this.currentPage });

    if (this.props.onChangePage) {
      this.props.onChangePage(this.currentPage, manualChange);
    }
  }

  _animateNextPage = () => {
    let currentPage = Math.floor((this.previousLeft + this.state.width / 2) / this.state.width);

    currentPage -= 1;

    if (currentPage < this.props.children.length * -1) {
      currentPage = -1;
      this.scrollSpring.setCurrentValue((currentPage + 1) * this.state.width);
    }

    this.movePage(currentPage, false);
  }

  _animatePreviousPage = () => {
    let currentPage = Math.floor((this.previousLeft + this.state.width / 2) / this.state.width);
    currentPage += 1;

    if (currentPage < this.props.children.length * -1) {
      currentPage = -1;
      this.scrollSpring.setCurrentValue((currentPage + 1) * this.state.width);
    }

    this.movePage(currentPage, false);
  }

  onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    this.setState({ width, height });
  }

  renderArrows = () => {
    const imageLeftSource = this.props.arrowLeftImage ? this.props.arrowLeftImage : require('./Icons/icon-left.png')
    const imageRightSource = this.props.arrowRightImage ? this.props.arrowRightImage : require('./Icons/icon-right.png')
    return (
      <ArrowsOverlay style={this.props.arrowsOverlayStyles}>
        <ArrowsRow style={this.props.arrowsRowStyles}>
          <ArrowButton style={this.props.arrowButtonStyles} disabled={this.previousPage === 0} hidden={this.previousPage === 0} onPress={() => this._animatePreviousPage()}>
            <ArrowImage style={this.props.arrowImageStyles} source={imageLeftSource} />
          </ArrowButton>
          <ArrowButton style={this.props.arrowButtonStyles} disabled={this.previousPage === -4} hidden={this.previousPage === -4} onPress={() => this._animateNextPage()}>
            <ArrowImage style={this.props.arrowImageStyles} source={imageRightSource} />
          </ArrowButton>
        </ArrowsRow>
      </ArrowsOverlay>
    )
  }

  render() {
    const width = this.state.width * this.props.children.length;

    const slideStyle = `
      width: ${this.state.width};
      height: ${this.state.height};
    `
    const slides = this.props.children.map((slide, index) => (
      <Slide
        key={index}
        style={slideStyle}
      >
        {slide}
      </Slide>
    ));
    return (
      <Container
        style={this.props.style}
        onLayout={this.onLayout}
        {...this.panResponder.panHandlers}
      >
        <ScrollPanel
          ref={scrollPanel => { this.scrollPanel = scrollPanel; }}
          width={width}
          style={this.props.scrollPanelStyles}
        >
          {slides}
          <Slide style={slideStyle}>
            {this.props.children[0]}
          </Slide>
        </ScrollPanel>
        { this.renderArrows() }
        <PagerIndicator
          currentPage={this.state.currentPage}
          {...this.props}
        />
      </Container>
    );
  }
}

Carousel.propTypes = {
  ...View.props,
};

export default Carousel;

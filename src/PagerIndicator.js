// @flow
import React from 'react';
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  pagerContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
});

function getPagerIndicatorStyle(color, pagerMargin, pagerSize) {
  return {
    backgroundColor: color,
    borderRadius: pagerSize / 2,
    borderWidth: 1,
    borderColor: '#fff',
    height: pagerSize,
    margin: pagerMargin,
    width: pagerSize,
  };
}

function PagerIndicator({
  activePagerColor,
  currentPage,
  pagerColor,
  pagerMargin,
  pagerOffset,
  pagerSize,
  children,
}) {
  const pager = children.map((child, index) => {
    let color = pagerColor;
    if (index + 1 === currentPage) {
      color = activePagerColor;
    }

    const pagerIndicatorStyle = getPagerIndicatorStyle(color, pagerMargin, pagerSize);
    return <View key={index} style={pagerIndicatorStyle} />;
  });

  const bottom = pagerOffset;
  return (
    <View style={[styles.pagerContainer, { bottom }]}>
      {pager}
    </View>
  );
}

PagerIndicator.propTypes = {
  activePagerColor: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.shape({})),
  currentPage: PropTypes.number,
  pagerColor: PropTypes.string,
  pagerMargin: PropTypes.number,
  pagerOffset: PropTypes.number,
  pagerSize: PropTypes.number,
};

PagerIndicator.defaultProps = {
  pagerOffset: 10,
  pagerMargin: 2,
  pagerSize: 10,
};

export default PagerIndicator;

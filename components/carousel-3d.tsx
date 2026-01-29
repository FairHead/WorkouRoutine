import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    PanResponder,
    Pressable,
    StyleSheet,
    View,
} from "react-native";

interface Carousel3DProps {
  children: React.ReactNode[];
  initialIndex?: number;
  /** Kontrollierter Index - Karussell springt zu diesem Index wenn er sich ändert */
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.55, 500);
const SWIPE_THRESHOLD = 50;

export function Carousel3D({
  children,
  initialIndex = 0,
  activeIndex,
  onIndexChange,
}: Carousel3DProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const items = React.Children.toArray(children);
  const itemCount = items.length;

  // Ein einziger animierter Wert der die "Scroll-Position" repräsentiert
  // Wert 0 = erstes Item, Wert 1 = zweites Item, etc.
  const scrollPosition = useRef(new Animated.Value(initialIndex)).current;
  const currentIndex = useRef(initialIndex);

  // Hilfsfunktion um Index zu wrappen
  const wrapIndex = useCallback(
    (index: number) => {
      return ((index % itemCount) + itemCount) % itemCount;
    },
    [itemCount],
  );

  // Animiere zu einem bestimmten Index
  const animateToIndex = useCallback(
    (targetIndex: number) => {
      const wrappedTarget = wrapIndex(targetIndex);
      currentIndex.current = wrappedTarget;
      onIndexChange?.(wrappedTarget);

      Animated.spring(scrollPosition, {
        toValue: targetIndex,
        useNativeDriver: true,
        tension: 50,
        friction: 12,
      }).start(() => {
        // Nach Animation: Normalisiere den Wert um große Zahlen zu vermeiden
        scrollPosition.setValue(wrappedTarget);
      });
    },
    [wrapIndex, scrollPosition, onIndexChange],
  );

  const goToPrev = useCallback(() => {
    animateToIndex(currentIndex.current - 1);
  }, [animateToIndex]);

  const goToNext = useCallback(() => {
    animateToIndex(currentIndex.current + 1);
  }, [animateToIndex]);

  const goToIndex = useCallback(
    (index: number) => {
      if (index === currentIndex.current) return;

      // Berechne kürzesten Weg (für wrap-around)
      let diff = index - currentIndex.current;
      if (itemCount > 2) {
        if (diff > itemCount / 2) diff -= itemCount;
        if (diff < -itemCount / 2) diff += itemCount;
      }

      animateToIndex(currentIndex.current + diff);
    },
    [animateToIndex, itemCount],
  );

  // Reagiere auf externe activeIndex-Änderungen
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex !== currentIndex.current) {
      goToIndex(activeIndex);
    }
  }, [activeIndex, goToIndex]);

  // PanResponder für Swipe-Gesten
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontal =
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return isHorizontal && Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        scrollPosition.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Konvertiere Pixel zu Index-Offset
        // Nach links swipen (dx < 0) = zu höherem Index scrollen
        const indexOffset = -gestureState.dx / (CARD_WIDTH * 0.5);
        scrollPosition.setValue(currentIndex.current + indexOffset);
      },
      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;

        let targetIndex = currentIndex.current;

        if (dx < -SWIPE_THRESHOLD || vx < -0.5) {
          // Nach links geswiped = nächste Karte
          targetIndex = currentIndex.current + 1;
        } else if (dx > SWIPE_THRESHOLD || vx > 0.5) {
          // Nach rechts geswiped = vorherige Karte
          targetIndex = currentIndex.current - 1;
        } else {
          // Zurück zur aktuellen Position
          targetIndex = currentIndex.current;
        }

        animateToIndex(targetIndex);
      },
      onPanResponderTerminate: () => {
        animateToIndex(currentIndex.current);
      },
    }),
  ).current;

  // Berechne den visuellen Offset für eine Karte
  const getCardAnimatedStyle = (index: number) => {
    // Berechne die relative Position zur aktuellen Scroll-Position
    // Berücksichtige wrap-around
    const relativePosition = scrollPosition.interpolate({
      inputRange: Array.from(
        { length: itemCount * 3 },
        (_, i) => i - itemCount,
      ),
      outputRange: Array.from({ length: itemCount * 3 }, (_, i) => {
        const scrollPos = i - itemCount;
        let diff = index - scrollPos;
        // Wrap around
        if (itemCount > 2) {
          if (diff > itemCount / 2) diff -= itemCount;
          if (diff < -itemCount / 2) diff += itemCount;
        }
        return diff;
      }),
      extrapolate: "clamp",
    });

    // TranslateX - Karten verschieben sich
    const translateX = relativePosition.interpolate({
      inputRange: [-2, -1, 0, 1, 2],
      outputRange: [
        -CARD_WIDTH * 0.6,
        -CARD_WIDTH * 0.32,
        0,
        CARD_WIDTH * 0.32,
        CARD_WIDTH * 0.6,
      ],
      extrapolate: "clamp",
    });

    // Scale - Mittlere Karte ist größer
    const scale = relativePosition.interpolate({
      inputRange: [-2, -1, 0, 1, 2],
      outputRange: [0.75, 0.85, 1, 0.85, 0.75],
      extrapolate: "clamp",
    });

    // RotateY - 3D Perspektive
    const rotateY = relativePosition.interpolate({
      inputRange: [-2, -1, 0, 1, 2],
      outputRange: ["25deg", "12deg", "0deg", "-12deg", "-25deg"],
      extrapolate: "clamp",
    });

    // Opacity - Außenstehende Karten sind durchsichtiger
    const opacity = relativePosition.interpolate({
      inputRange: [-2, -1, 0, 1, 2],
      outputRange: [0.4, 0.7, 1, 0.7, 0.4],
      extrapolate: "clamp",
    });

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { translateX },
        { scale },
        { rotateY },
      ],
    };
  };

  // Z-Index basierend auf aktuellem Index (nicht animiert)
  const getZIndex = (index: number) => {
    let diff = index - currentIndex.current;
    if (itemCount > 2) {
      if (diff > itemCount / 2) diff -= itemCount;
      if (diff < -itemCount / 2) diff += itemCount;
    }
    return 10 - Math.abs(diff);
  };

  // Aktiver Index für Dots (re-render bei Änderung)
  const [displayIndex, setDisplayIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    const listenerId = scrollPosition.addListener(({ value }) => {
      const rounded = Math.round(value);
      const wrapped = wrapIndex(rounded);
      if (wrapped !== displayIndex) {
        setDisplayIndex(wrapped);
      }
    });
    return () => scrollPosition.removeListener(listenerId);
  }, [scrollPosition, displayIndex, wrapIndex]);

  return (
    <View style={styles.container}>
      {/* Carousel Container */}
      <View style={styles.carouselContainer} {...panResponder.panHandlers}>
        {items.map((child, index) => {
          const animatedStyle = getCardAnimatedStyle(index);
          const zIndex = getZIndex(index);

          return (
            <Animated.View
              key={index}
              style={[
                styles.cardWrapper,
                {
                  width: CARD_WIDTH,
                  maxHeight: CARD_HEIGHT,
                  zIndex,
                  opacity: animatedStyle.opacity,
                  transform: animatedStyle.transform,
                },
              ]}
            >
              <Pressable
                style={styles.cardPressable}
                onPress={() => {
                  if (index !== displayIndex) {
                    goToIndex(index);
                  }
                }}
              >
                {child}
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      {/* Navigation Arrows */}
      <View style={styles.navigationContainer}>
        <Pressable
          style={[styles.navButton, { backgroundColor: colors.cardBackground }]}
          onPress={goToPrev}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>

        <Pressable
          style={[styles.navButton, { backgroundColor: colors.cardBackground }]}
          onPress={goToNext}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Dot Indicators */}
      <View style={styles.dotsContainer}>
        {items.map((_, index) => (
          <Pressable key={index} onPress={() => goToIndex(index)}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === displayIndex ? colors.accent : colors.border,
                  width: index === displayIndex ? 20 : 8,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 16,
  },
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: CARD_HEIGHT + 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  cardPressable: {
    width: "100%",
  },
  navigationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 32,
    marginTop: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

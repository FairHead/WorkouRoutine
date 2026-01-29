import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type SharedValue<T> = Animated.SharedValue<T>;

interface DraggableItem {
  id: string;
  name: string;
}

interface DraggableListProps<T extends DraggableItem> {
  items: T[];
  onReorder: (newOrder: string[]) => void;
  renderItem?: (item: T, index: number) => React.ReactNode;
}

const ITEM_HEIGHT = 56;
const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
};

function DraggableListItem<T extends DraggableItem>({
  item,
  index,
  itemCount,
  onDragStart,
  onDragEnd,
  onDragUpdate,
  isDragging,
  draggedIndex,
  translateY,
}: {
  item: T;
  index: number;
  itemCount: number;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onDragUpdate: (translationY: number) => void;
  isDragging: boolean;
  draggedIndex: number | null;
  translateY: SharedValue<number>;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isBeingDragged = draggedIndex === index;
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(0);

  const gesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      scale.value = withSpring(1.03, SPRING_CONFIG);
      zIndex.value = 100;
      runOnJS(onDragStart)(index);
    })
    .onUpdate((event) => {
      if (isBeingDragged || draggedIndex === null) {
        runOnJS(onDragUpdate)(event.translationY);
      }
    })
    .onEnd(() => {
      scale.value = withSpring(1, SPRING_CONFIG);
      zIndex.value = 0;
      runOnJS(onDragEnd)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, SPRING_CONFIG);
      zIndex.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    let yOffset = 0;

    if (isBeingDragged) {
      yOffset = translateY.value;
    } else if (draggedIndex !== null && !isBeingDragged) {
      const dragOffset = translateY.value;
      const draggedTo = draggedIndex + Math.round(dragOffset / ITEM_HEIGHT);

      if (index > draggedIndex && index <= draggedTo) {
        yOffset = -ITEM_HEIGHT;
      } else if (index < draggedIndex && index >= draggedTo) {
        yOffset = ITEM_HEIGHT;
      }
    }

    return {
      transform: [
        {
          translateY: isBeingDragged
            ? translateY.value
            : withSpring(yOffset, SPRING_CONFIG),
        },
        { scale: scale.value },
      ],
      zIndex: isBeingDragged ? 100 : zIndex.value,
      shadowOpacity: isBeingDragged ? 0.2 : 0,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.item,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.itemContent}>
          <View
            style={[
              styles.numberBadge,
              { backgroundColor: colors.accent + "20" },
            ]}
          >
            <Text style={[styles.numberText, { color: colors.accent }]}>
              {index + 1}
            </Text>
          </View>
          <Text
            style={[styles.itemName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
        </View>
        <View style={styles.dragHandle}>
          <Ionicons name="menu" size={22} color={colors.textSecondary} />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

export function DraggableList<T extends DraggableItem>({
  items,
  onReorder,
}: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const translateY = useSharedValue(0);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const handleDragStart = useCallback(
    (index: number) => {
      setDraggedIndex(index);
      translateY.value = 0;
    },
    [translateY],
  );

  const handleDragUpdate = useCallback(
    (translationY: number) => {
      translateY.value = translationY;
    },
    [translateY],
  );

  const handleDragEnd = useCallback(() => {
    if (draggedIndex === null) return;

    const offset = translateY.value;
    const moveBy = Math.round(offset / ITEM_HEIGHT);
    const newIndex = Math.max(
      0,
      Math.min(itemsRef.current.length - 1, draggedIndex + moveBy),
    );

    if (newIndex !== draggedIndex) {
      const newItems = [...itemsRef.current];
      const [movedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      onReorder(newItems.map((item) => item.id));
    }

    translateY.value = withTiming(0, { duration: 200 });
    setDraggedIndex(null);
  }, [draggedIndex, translateY, onReorder]);

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <DraggableListItem
          key={item.id}
          item={item}
          index={index}
          itemCount={items.length}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragUpdate={handleDragUpdate}
          isDragging={draggedIndex !== null}
          draggedIndex={draggedIndex}
          translateY={translateY}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: ITEM_HEIGHT,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  numberText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
  itemName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
    flex: 1,
  },
  dragHandle: {
    padding: 4,
  },
});

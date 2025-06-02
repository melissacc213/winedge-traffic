import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
  Tooltip,
  UnstyledButton,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import React, { useEffect,useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Circle,
  Image as KonvaImage,
  Layer,
  Line,
  Rect,
  Stage,
} from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";

import { useRecipeStore } from "../../../lib/store/recipe-store";
import type {
  FrameData,
  Region,
  RegionConnection,
  RegionPoint,
  RoadType,
} from "../../../types/recipe";
import { Icons } from "../../icons";
import { RoadTypeIcon } from "../../road-type-icon";

interface RoadTypeOption {
  value: RoadType;
  label: string;
}

export function RegionSetupStep() {
  const { t } = useTranslation(["recipes", "common"]);
  const {
    formValues,
    addRegion,
    updateRegion,
    deleteRegion,
    updateConnections,
    setROI,
  } = useRecipeStore();
  const theme = useMantineTheme();
  const computedColorScheme = useComputedColorScheme();
  const isDark = computedColorScheme === 'dark';

  // Use the same dimensions as task-type-with-video-step
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  const [videoSize] = useState({ height: STAGE_HEIGHT, width: STAGE_WIDTH });

  // Check if we're in rectangle-only mode (for train detection)
  const isRectangleMode = formValues.taskType === "trainDetection";

  // State management
  const [, setSelectedRegion] = useState<Region | null>(null);
  const [regionName, setRegionName] = useState("");
  const [roadType, setRoadType] = useState<RoadType>("straight");
  const [editingRegion, setEditingRegion] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<RegionPoint[]>([]);
  const [connections, setConnections] = useState<RegionConnection[]>([]);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(
    null
  );
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [sourceRegionId, setSourceRegionId] = useState<string | null>(null);
  const [destinationRegionId, setDestinationRegionId] = useState<string | null>(
    null
  );
  const [showNameError, setShowNameError] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Rectangle drawing state
  const [rectangleStart, setRectangleStart] = useState<RegionPoint | null>(
    null
  );
  const [isDrawingRect, setIsDrawingRect] = useState(false);

  // UI state
  const [roadTypeSelectorOpened, { toggle: toggleRoadTypeSelector }] =
    useDisclosure(false);
  const [activeTab, setActiveTab] = useState<string>("regions");

  // Mouse position for hover label
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [showHoverLabel, setShowHoverLabel] = useState(false);
  const [hoverLabelText, setHoverLabelText] = useState("");

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false);
  const [editablePoints, setEditablePoints] = useState<RegionPoint[]>([]);
  const [, setSelectedPointIndex] = useState<number | null>(null);

  // Region dragging states
  const [isDraggingRegion, setIsDraggingRegion] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [originalPoints, setOriginalPoints] = useState<RegionPoint[]>([]);

  // Modal states
  const [showRoadTypeModal, setShowRoadTypeModal] = useState(false);
  const [pendingRoadType, setPendingRoadType] = useState<RoadType | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<{
    id: string;
    name: string;
    connections: RegionConnection[];
  } | null>(null);

  const stageRef = useRef<KonvaStage>(null);

  // Constants for consistent sizing
  const POINT_RADIUS = 5;
  const POINT_HOVER_RADIUS = 7;
  const STROKE_WIDTH = 2;
  const STROKE_WIDTH_HOVER = 3;

  // Canvas size is fixed, no need to update on viewport changes

  // Initialize connections from formValues on mount
  useEffect(() => {
    if (formValues.connections) {
      setConnections(formValues.connections);
    }
  }, [formValues.connections]); // Include formValues.connections in dependencies
  // Define 20 distinct colors for regions
  const REGION_PALETTE = [
    theme.colors.blue[5],
    theme.colors.red[5],
    theme.colors.green[5],
    theme.colors.yellow[7],
    theme.colors.indigo[5],
    theme.colors.teal[5],
    theme.colors.orange[5],
    theme.colors.cyan[6],
    theme.colors.pink[5],
    theme.colors.lime[6],
    theme.colors.violet[5],
    theme.colors.grape[5],
    theme.colors.blue[7],
    theme.colors.red[7],
    theme.colors.green[7],
    theme.colors.indigo[7],
    theme.colors.teal[7],
    theme.colors.orange[7],
    theme.colors.pink[7],
    theme.colors.violet[7],
  ];

  const getRegionColor = (regionId: string) => {
    const regionIndex = regions.findIndex((r) => r.id === regionId);
    if (regionIndex === -1) {
      return REGION_PALETTE[regions.length % REGION_PALETTE.length];
    }
    return REGION_PALETTE[regionIndex % REGION_PALETTE.length];
  };

  // Get extracted frame data if available
  const capturedFrame: FrameData | null = formValues.extractedFrame
    ? JSON.parse(formValues.extractedFrame)
    : null;

  // Load the captured frame image
  const [frameImage] = useImage(capturedFrame?.imageDataUrl || "");

  const regions = formValues.regions || [];

  // Road type options
  const roadTypeOptions: RoadTypeOption[] = [
    { label: t("recipes:roadType.straight", "Straight"), value: "straight" },
    {
      label: t("recipes:roadType.tJunction", "T-Junction"),
      value: "tJunction",
    },
    {
      label: t("recipes:roadType.crossroads", "Crossroads"),
      value: "crossroads",
    },
  ];

  // Event handlers
  const handleRoadTypeChange = (newRoadType: RoadType) => {
    if (regions.length > 0 || connections.length > 0) {
      setPendingRoadType(newRoadType);
      setShowRoadTypeModal(true);
    } else {
      setRoadType(newRoadType);
    }
  };

  const confirmRoadTypeChange = () => {
    if (pendingRoadType) {
      setRoadType(pendingRoadType);
      regions.forEach((region) => deleteRegion(region.id));
      setConnections([]);
      updateConnections([]);
      setIsDrawing(false);
      setCurrentPoints([]);
      setEditingRegion(null);
      setSelectedRegion(null);
      setSourceRegionId(null);
      setDestinationRegionId(null);
      setIsEditMode(false);
    }
    setShowRoadTypeModal(false);
    setPendingRoadType(null);
  };

  const handleStageMouseMove = (_: KonvaEventObject<MouseEvent>) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (pointer) {
      setMousePos({ x: pointer.x, y: pointer.y });
    }

    if (isDraggingRegion) {
      handleStageMouseMoveForDrag();
    }
  };

  const handleStageClick = (_: KonvaEventObject<MouseEvent>) => {
    if (isDraggingRegion) return;
    if (isEditMode) return;
    if (!isDrawing) return;

    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getPointerPosition();

    if (point) {
      if (isRectangleMode) {
        // Rectangle mode for train detection
        if (!isDrawingRect) {
          // First click - start drawing rectangle
          setRectangleStart(point);
          setIsDrawingRect(true);
        } else {
          // Second click - finish rectangle
          const minX = Math.min(rectangleStart!.x, point.x);
          const minY = Math.min(rectangleStart!.y, point.y);
          const maxX = Math.max(rectangleStart!.x, point.x);
          const maxY = Math.max(rectangleStart!.y, point.y);

          setCurrentPoints([
            { x: minX, y: minY },
            { x: maxX, y: minY },
            { x: maxX, y: maxY },
            { x: minX, y: maxY },
          ]);
          setIsDrawingRect(false);
          setRectangleStart(null);
        }
      } else {
        // Polygon mode for other task types
        setCurrentPoints([...currentPoints, { x: point.x, y: point.y }]);
      }
    }
  };

  const handleAddRegion = () => {
    // In rectangle mode with existing region, set up for editing
    if (isRectangleMode && regions.length > 0) {
      const existingRegion = regions[0];
      setEditingRegion(existingRegion.id);
      // Don't set region name for rectangle mode
    } else if (!isRectangleMode) {
      setRegionName("");
    }

    setSelectedRegion(null);
    setIsDrawing(true);
    setCurrentPoints([]);
    setIsEditMode(false);
    setRectangleStart(null);
    setIsDrawingRect(false);
    setShowNameError(false);
  };

  const handleSaveRegion = () => {
    // In rectangle mode, require exactly 4 points
    if (isRectangleMode) {
      if (currentPoints.length !== 4) {
        return;
      }

      // For rectangle mode, use a default name if updating
      const trimmedName = regionName.trim() || "Detection Area";

      // Calculate ROI bounds
      const x1 = Math.min(currentPoints[0].x, currentPoints[2].x);
      const y1 = Math.min(currentPoints[0].y, currentPoints[2].y);
      const x2 = Math.max(currentPoints[0].x, currentPoints[2].x);
      const y2 = Math.max(currentPoints[0].y, currentPoints[2].y);

      // Set ROI
      setROI({ x1, x2, y1, y2 });

      if (editingRegion) {
        // Update existing region
        const updatedRegion: Region = {
          id: editingRegion,
          name: trimmedName,
          points: currentPoints,
          roadType: roadType,
          type: "countLine",
        };
        updateRegion(updatedRegion);
      } else {
        // In rectangle mode, only allow one region
        if (regions.length > 0) {
          // Clear existing regions first
          regions.forEach((r) => deleteRegion(r.id));
        }

        const newRegion: Region = {
          id: uuidv4(),
          name: trimmedName,
          points: currentPoints,
          roadType: roadType,
          type: "countLine",
        };
        addRegion(newRegion);
      }

      setIsDrawing(false);
      setCurrentPoints([]);
      setRegionName("");
      setEditingRegion(null);
      setSelectedRegion(null);
      return;
    }

    // Original logic for non-rectangle mode
    if (currentPoints.length < 3) {
      return;
    }

    // Validate region name
    const trimmedName = regionName.trim();
    if (!trimmedName) {
      // Don't save without a name - show error
      setShowNameError(true);
      return;
    }

    // Check for duplicate names
    const isDuplicate = regions.some(
      (r) =>
        r.name.toLowerCase() === trimmedName.toLowerCase() &&
        r.id !== editingRegion
    );
    if (isDuplicate) {
      setShowNameError(true);
      return;
    }

    if (editingRegion) {
      const updatedRegion: Region = {
        id: editingRegion,
        name: trimmedName,
        points: currentPoints,
        roadType: roadType,
        type: "countLine",
      };
      updateRegion(updatedRegion);
    } else {
      const newRegion: Region = {
        id: uuidv4(),
        name: trimmedName,
        points: currentPoints,
        roadType: roadType,
        type: "countLine",
      };
      addRegion(newRegion);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setRegionName("");
    setEditingRegion(null);
    setSelectedRegion(null);
    setShowNameError(false);
  };

  const handleEditRegion = (region: Region) => {
    setIsDrawing(false);
    setCurrentPoints([]);
    setSelectedPointIndex(null);
    setIsDraggingRegion(false);

    setIsEditMode(true);
    setEditingRegion(region.id);
    setSelectedRegion(region);
    setRegionName(region.name);
    setEditablePoints([...region.points]);
    setShowNameError(false);
  };

  const handleSaveEdit = () => {
    if (editingRegion && editablePoints.length >= 3) {
      // Validate region name
      const trimmedName = regionName.trim();
      if (!trimmedName) {
        setShowNameError(true);
        return;
      }

      // Check for duplicate names
      const isDuplicate = regions.some(
        (r) =>
          r.name.toLowerCase() === trimmedName.toLowerCase() &&
          r.id !== editingRegion
      );
      if (isDuplicate) {
        setShowNameError(true);
        return;
      }

      const updatedRegion: Region = {
        id: editingRegion,
        name: trimmedName,
        points: editablePoints,
        roadType: roadType,
        type: "countLine",
      };
      updateRegion(updatedRegion);

      setIsEditMode(false);
      setEditingRegion(null);
      setSelectedRegion(null);
      setEditablePoints([]);
      setRegionName("");
      setIsDraggingRegion(false);
      setDragStartPos({ x: 0, y: 0 });
      setOriginalPoints([]);
      setShowNameError(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingRegion(null);
    setSelectedRegion(null);
    setEditablePoints([]);
    setIsDrawing(false);
    setCurrentPoints([]);
    setRegionName("");
    setIsDraggingRegion(false);
    setDragStartPos({ x: 0, y: 0 });
    setOriginalPoints([]);
    // Clear rectangle drawing states
    setRectangleStart(null);
    setIsDrawingRect(false);
    setShowNameError(false);
  };

  const handleDeleteRegion = (regionId: string) => {
    const regionConnections = connections.filter(
      (conn) => conn.sourceId === regionId || conn.destinationId === regionId
    );

    if (regionConnections.length > 0) {
      const regionName =
        regions.find((r) => r.id === regionId)?.name || "Unknown Region";
      setRegionToDelete({
        connections: regionConnections,
        id: regionId,
        name: regionName,
      });
      setShowDeleteModal(true);
    } else {
      performRegionDeletion(regionId);
    }
  };

  const performRegionDeletion = (regionId: string) => {
    deleteRegion(regionId);
    // Connections are now handled in the store when deleting a region
    if (editingRegion === regionId) {
      handleCancelEdit();
    }
  };

  const handlePointDrag = (
    pointIndex: number,
    newPos: { x: number; y: number }
  ) => {
    const newPoints = [...editablePoints];
    newPoints[pointIndex] = newPos;
    setEditablePoints(newPoints);
  };

  const handleRegionMouseDown = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setIsDraggingRegion(true);
    setDragStartPos({ x: pointer.x, y: pointer.y });
    setOriginalPoints([...editablePoints]);

    stage.container().style.cursor = "grabbing";
  };

  const handleStageMouseMoveForDrag = () => {
    if (!isDraggingRegion) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const deltaX = pointer.x - dragStartPos.x;
    const deltaY = pointer.y - dragStartPos.y;

    const newPoints = originalPoints.map((point) => ({
      x: point.x + deltaX,
      y: point.y + deltaY,
    }));

    setEditablePoints(newPoints);
  };

  const handleStageMouseUp = () => {
    if (isDraggingRegion) {
      setIsDraggingRegion(false);
      setDragStartPos({ x: 0, y: 0 });
      setOriginalPoints([]);

      const stage = stageRef.current;
      if (stage) {
        stage.container().style.cursor = "default";
      }
    }
  };

  const handleRegionHover = (region: Region, isEntering: boolean) => {
    if (isEntering) {
      setHoveredRegion(region.id);
      setHoverLabelText(region.name);
      setShowHoverLabel(true);
    } else {
      setHoveredRegion(null);
      setShowHoverLabel(false);
      setHoverLabelText("");
    }
  };

  const handleSaveDirection = () => {
    if (
      sourceRegionId &&
      destinationRegionId &&
      sourceRegionId !== destinationRegionId
    ) {
      const alreadyExists = connections.some(
        (c) =>
          c.sourceId === sourceRegionId &&
          c.destinationId === destinationRegionId
      );

      if (alreadyExists) {
        setConnectionError("This connection already exists");
        return;
      }

      const newConnections = [
        ...connections,
        {
          destinationId: destinationRegionId,
          id: uuidv4(),
          sourceId: sourceRegionId,
        },
      ];
      setConnections(newConnections);
      updateConnections(newConnections);
      setSourceRegionId(null);
      setDestinationRegionId(null);
      setConnectionError(null);
    }
  };

  return (
    <Paper
      withBorder
      p="md"
      radius="md"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Compact Header */}
      <Box pb="sm" style={{ flexShrink: 0 }}>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Icons.Polygon
              size={20}
              color={theme.colors[theme.primaryColor][6]}
            />
            <Title order={4}>{t("recipes:creation.regionSetup.title")}</Title>
            <Badge
              size="sm"
              variant={isDark ? "filled" : "light"}
            >
              {isRectangleMode
                ? regions.length > 0
                  ? "ROI configured"
                  : "No ROI"
                : `${regions.length} regions • ${connections.length} connections`}
            </Badge>
          </Group>

          {/* Road Type Selector Button - hide for train detection */}
          {!isRectangleMode && (
            <Button
              variant="subtle"
              size="sm"
              rightSection={
                <Icons.ChevronDown
                  size={16}
                  style={{
                    transform: roadTypeSelectorOpened
                      ? "rotate(180deg)"
                      : "none",
                    transition: "transform 0.2s",
                  }}
                />
              }
              onClick={toggleRoadTypeSelector}
            >
              <Group gap="xs">
                <RoadTypeIcon type={roadType} size={20} />
                <Text size="sm">
                  {roadTypeOptions.find((opt) => opt.value === roadType)?.label}
                </Text>
              </Group>
            </Button>
          )}
        </Group>
      </Box>

      {/* Collapsible Road Type Selector - hide for train detection */}
      {!isRectangleMode && (
        <Collapse in={roadTypeSelectorOpened}>
          <Box px="md" pb="md">
            <Card
              withBorder
              p="sm"
              radius="md"
              style={{
                backgroundColor:
                  isDark 
                    ? theme.colors.dark?.[7] || theme.colors.gray[8] 
                    : theme.white,
              }}
            >
              <SimpleGrid cols={{ base: 3 }}>
                {roadTypeOptions.map((option) => (
                  <UnstyledButton
                    key={option.value}
                    p="sm"
                    style={{
                      backgroundColor:
                        roadType === option.value
                          ? isDark
                            ? `${theme.colors[theme.primaryColor][8]}40`
                            : `${theme.colors[theme.primaryColor][0]}50`
                          : isDark
                            ? theme.colors.gray[8]
                            : theme.colors.gray[0],
                      border: `2px solid ${roadType === option.value ? theme.colors[theme.primaryColor][5] : theme.colors.gray[isDark ? 7 : 2]}`,
                      borderRadius: theme.radius.md,
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => handleRoadTypeChange(option.value)}
                    onMouseEnter={(e) => {
                      if (roadType !== option.value) {
                        e.currentTarget.style.backgroundColor =
                          isDark
                            ? theme.colors.gray[7]
                            : theme.colors.gray[1];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (roadType !== option.value) {
                        e.currentTarget.style.backgroundColor =
                          isDark
                            ? theme.colors.gray[8]
                            : theme.colors.gray[0];
                      }
                    }}
                  >
                    <Center>
                      <Stack gap="xs" align="center">
                        <Box
                          style={{
                            alignItems: "center",
                            display: "flex",
                            height: 60,
                            justifyContent: "center",
                          }}
                        >
                          <RoadTypeIcon type={option.value} size={50} />
                        </Box>
                        <Text
                          size="sm"
                          fw={roadType === option.value ? 600 : 500}
                        >
                          {option.label}
                        </Text>
                      </Stack>
                    </Center>
                  </UnstyledButton>
                ))}
              </SimpleGrid>
            </Card>
          </Box>
        </Collapse>
      )}

      {/* Main Content - Side by side layout */}
      <Flex gap="md" style={{ flex: 1, overflow: "hidden" }}>
        {/* Left Panel - Canvas */}
        <Box style={{ display: "flex", flex: 1, minWidth: 0 }}>
          <Card
            withBorder
            p="sm"
            radius="md"
            style={{
              backgroundColor:
                isDark 
                  ? theme.colors.dark?.[7] || theme.colors.gray[8] 
                  : theme.white,
              display: "flex",
              flexDirection: "column",
              height: 524,
              width: "100%",
            }}
          >
            <Stack gap="sm" style={{ flex: 1 }}>
              {/* Canvas Header */}
              <Group justify="space-between" align="center">
                {/* Instructions on the left */}
                {isDrawing && !isEditMode && (
                  <Group gap="xs">
                    <Icons.InfoCircle
                      size={14}
                      color={theme.colors[theme.primaryColor][6]}
                      style={{ opacity: 0.7 }}
                    />
                    <Text
                      size="xs"
                      c={isDark ? "gray.5" : "gray.6"}
                      style={{ fontStyle: "italic" }}
                    >
                      {isRectangleMode
                        ? "Click to set rectangle corners"
                        : "Click to add points (min 3)"}
                    </Text>
                  </Group>
                )}
                {isEditMode && (
                  <Group gap="xs">
                    <Icons.InfoCircle
                      size={14}
                      color={theme.colors[theme.primaryColor][6]}
                      style={{ opacity: 0.7 }}
                    />
                    <Text
                      size="xs"
                      c={isDark ? "gray.5" : "gray.6"}
                      style={{ fontStyle: "italic" }}
                    >
                      Drag region to move, drag points to adjust
                    </Text>
                  </Group>
                )}
                {!isDrawing && !isEditMode && (
                  <Group gap="xs" align="center">
                    <Icons.Camera size={14} color={theme.colors.gray[6]} />
                    <Text size="xs" c="dimmed">
                      Frame: {videoSize.width} × {videoSize.height} px
                    </Text>
                  </Group>
                )}

                {/* Buttons on the right */}
                <Group gap="xs">
                  {!isDrawing && !isEditMode && (
                    <Button
                      leftSection={
                        isRectangleMode && regions.length > 0 ? (
                          <Icons.Edit size={14} />
                        ) : (
                          <Icons.Plus size={14} />
                        )
                      }
                      onClick={handleAddRegion}
                      size="xs"
                      variant="light"
                    >
                      {isRectangleMode && regions.length > 0
                        ? "Update Region"
                        : "Add Region"}
                    </Button>
                  )}
                  {isDrawing && !isEditMode && (
                    <>
                      <Button
                        variant="light"
                        color="red"
                        onClick={handleCancelEdit}
                        size="xs"
                        leftSection={<Icons.X size={14} />}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="light"
                        disabled={
                          isRectangleMode
                            ? currentPoints.length !== 4 // Rectangle needs exactly 4 points
                            : currentPoints.length < 3
                        }
                        onClick={handleSaveRegion}
                        size="xs"
                        leftSection={<Icons.Check size={14} />}
                      >
                        Save
                      </Button>
                    </>
                  )}
                  {isEditMode && (
                    <>
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={handleCancelEdit}
                        size="sm"
                        leftSection={<Icons.X size={14} />}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveEdit}
                        size="sm"
                        variant="light"
                        leftSection={<Icons.Check size={14} />}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                </Group>
              </Group>

              {/* Canvas */}
              <Box
                style={{
                  alignItems: "center",
                  backgroundColor:
                    isDark
                      ? theme.colors.gray[9]
                      : theme.colors.gray[1],
                  borderRadius: theme.radius.md,
                  display: "flex",
                  height: STAGE_HEIGHT,
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Stage
                  ref={stageRef}
                  width={videoSize.width}
                  height={videoSize.height}
                  onClick={handleStageClick}
                  onMouseMove={handleStageMouseMove}
                  onMouseUp={handleStageMouseUp}
                  style={{
                    backgroundColor:
                      isDark 
                        ? theme.colors.dark?.[8] || theme.colors.gray[9] 
                        : theme.white,
                    borderRadius: theme.radius.md,
                  }}
                >
                  <Layer>
                    {frameImage ? (
                      <KonvaImage
                        image={frameImage}
                        width={videoSize.width}
                        height={videoSize.height}
                        x={0}
                        y={0}
                      />
                    ) : (
                      <Rect
                        width={videoSize.width}
                        height={videoSize.height}
                        fill={
                          isDark
                            ? theme.colors.dark?.[7] || theme.colors.gray[8]
                            : theme.white
                        }
                      />
                    )}

                    {/* Draw connections first (below regions) */}
                    {connections.map((conn) => {
                      const sourceRegion = regions.find(
                        (r) => r.id === conn.sourceId
                      );
                      const destRegion = regions.find(
                        (r) => r.id === conn.destinationId
                      );

                      if (!sourceRegion || !destRegion) return null;

                      // Calculate center points of regions
                      const sourceCenter = {
                        x:
                          sourceRegion.points.reduce((sum, p) => sum + p.x, 0) /
                          sourceRegion.points.length,
                        y:
                          sourceRegion.points.reduce((sum, p) => sum + p.y, 0) /
                          sourceRegion.points.length,
                      };
                      const destCenter = {
                        x:
                          destRegion.points.reduce((sum, p) => sum + p.x, 0) /
                          destRegion.points.length,
                        y:
                          destRegion.points.reduce((sum, p) => sum + p.y, 0) /
                          destRegion.points.length,
                      };

                      // Calculate arrow angle
                      const angle = Math.atan2(
                        destCenter.y - sourceCenter.y,
                        destCenter.x - sourceCenter.x
                      );
                      const arrowLength = 15;
                      const arrowAngle = Math.PI / 6;

                      const isHovered = hoveredConnection === conn.id;

                      return (
                        <React.Fragment key={conn.id}>
                          {/* Connection line */}
                          <Line
                            points={[
                              sourceCenter.x,
                              sourceCenter.y,
                              destCenter.x,
                              destCenter.y,
                            ]}
                            stroke={
                              isHovered
                                ? theme.colors.green[5]
                                : theme.colors.green[7]
                            }
                            strokeWidth={isHovered ? 3 : 2}
                            opacity={0.6}
                            dash={[10, 5]}
                          />
                          {/* Arrowhead */}
                          <Line
                            points={[
                              destCenter.x -
                                arrowLength * Math.cos(angle - arrowAngle),
                              destCenter.y -
                                arrowLength * Math.sin(angle - arrowAngle),
                              destCenter.x,
                              destCenter.y,
                              destCenter.x -
                                arrowLength * Math.cos(angle + arrowAngle),
                              destCenter.y -
                                arrowLength * Math.sin(angle + arrowAngle),
                            ]}
                            stroke={
                              isHovered
                                ? theme.colors.green[5]
                                : theme.colors.green[7]
                            }
                            strokeWidth={isHovered ? 3 : 2}
                            lineCap="round"
                            lineJoin="round"
                            opacity={0.6}
                          />
                        </React.Fragment>
                      );
                    })}

                    {/* Draw existing regions */}
                    {regions.map((region) => {
                      const isHighlighted = hoveredRegion === region.id;
                      const regionColor = getRegionColor(region.id);
                      const isBeingEdited =
                        editingRegion === region.id && isEditMode;

                      return (
                        <React.Fragment key={region.id}>
                          <Line
                            points={region.points.flatMap((p) => [p.x, p.y])}
                            closed={true}
                            fill={regionColor + (isHighlighted ? "30" : "20")}
                            stroke={regionColor}
                            strokeWidth={
                              isHighlighted ? STROKE_WIDTH_HOVER : STROKE_WIDTH
                            }
                            onMouseEnter={() => handleRegionHover(region, true)}
                            onMouseLeave={() =>
                              handleRegionHover(region, false)
                            }
                            visible={!isBeingEdited}
                          />
                          {/* Draw points for saved regions - THIS WAS MISSING */}
                          {!isBeingEdited &&
                            region.points.map((point, i) => (
                              <Circle
                                key={`${region.id}-point-${i}`}
                                x={point.x}
                                y={point.y}
                                radius={POINT_RADIUS}
                                fill={
                                  isDark
                                    ? theme.colors.gray[4]
                                    : "white"
                                }
                                stroke={regionColor}
                                strokeWidth={2}
                                visible={!isBeingEdited}
                              />
                            ))}
                        </React.Fragment>
                      );
                    })}

                    {/* Draw editable region in edit mode */}
                    {isEditMode && editingRegion && (
                      <>
                        <Line
                          points={editablePoints.flatMap((p) => [p.x, p.y])}
                          closed={true}
                          fill={getRegionColor(editingRegion) + "30"}
                          stroke={getRegionColor(editingRegion)}
                          strokeWidth={STROKE_WIDTH}
                          strokeDasharray={[5, 5]}
                          onMouseDown={handleRegionMouseDown}
                          onMouseEnter={(e) => {
                            const stage = e.target.getStage();
                            if (stage && !isDraggingRegion) {
                              stage.container().style.cursor = "grab";
                            }
                          }}
                          onMouseLeave={(e) => {
                            const stage = e.target.getStage();
                            if (stage && !isDraggingRegion) {
                              stage.container().style.cursor = "default";
                            }
                          }}
                        />
                        {/* Editable points */}
                        {editablePoints.map((point, i) => (
                          <Circle
                            key={`edit-point-${i}`}
                            x={point.x}
                            y={point.y}
                            radius={POINT_HOVER_RADIUS}
                            fill={
                              isDark
                                ? theme.colors.gray[4]
                                : "white"
                            }
                            stroke={getRegionColor(editingRegion)}
                            strokeWidth={2}
                            draggable
                            onDragMove={(e) => {
                              handlePointDrag(i, {
                                x: e.target.x(),
                                y: e.target.y(),
                              });
                            }}
                            onMouseEnter={(e) => {
                              const stage = e.target.getStage();
                              if (stage) {
                                stage.container().style.cursor = "crosshair";
                              }
                            }}
                            onMouseLeave={(e) => {
                              const stage = e.target.getStage();
                              if (stage) {
                                stage.container().style.cursor = "default";
                              }
                            }}
                          />
                        ))}
                      </>
                    )}

                    {/* Draw current region being created */}
                    {currentPoints.length > 0 && !isEditMode && (
                      <>
                        <Line
                          points={currentPoints.flatMap((p) => [p.x, p.y])}
                          closed={currentPoints.length > 2}
                          fill={getRegionColor("new-region") + "25"}
                          stroke={getRegionColor("new-region")}
                          strokeWidth={STROKE_WIDTH}
                          strokeDasharray={[8, 4]}
                        />
                        {/* Draw points for current region (not in rectangle mode) */}
                        {!isRectangleMode &&
                          currentPoints.map((point, i) => (
                            <Circle
                              key={i}
                              x={point.x}
                              y={point.y}
                              radius={POINT_RADIUS}
                              fill={
                                isDark
                                  ? theme.colors.gray[4]
                                  : "white"
                              }
                              stroke={getRegionColor("new-region")}
                              strokeWidth={2}
                            />
                          ))}
                      </>
                    )}

                    {/* Draw rectangle preview when in rectangle mode */}
                    {isRectangleMode &&
                      isDrawingRect &&
                      rectangleStart &&
                      mousePos && (
                        <Rect
                          x={Math.min(rectangleStart.x, mousePos.x)}
                          y={Math.min(rectangleStart.y, mousePos.y)}
                          width={Math.abs(mousePos.x - rectangleStart.x)}
                          height={Math.abs(mousePos.y - rectangleStart.y)}
                          fill={getRegionColor("new-region") + "25"}
                          stroke={getRegionColor("new-region")}
                          strokeWidth={STROKE_WIDTH}
                          strokeDasharray={[8, 4]}
                        />
                      )}
                  </Layer>
                </Stage>

                {/* Hover label */}
                {showHoverLabel && (
                  <Box
                    style={{
                      backgroundColor:
                        isDark
                          ? theme.colors.gray[9] + "cc"
                          : theme.colors.gray[7] + "cc",
                      borderRadius: theme.radius.md,
                      color: "white",
                      fontSize: "12px",
                      fontWeight: 500,
                      left: mousePos.x + 10,
                      padding: "4px 8px",
                      pointerEvents: "none",
                      position: "absolute",
                      top: mousePos.y - 10,
                      whiteSpace: "nowrap",
                      zIndex: 1000,
                    }}
                  >
                    {hoverLabelText}
                  </Box>
                )}
              </Box>
            </Stack>
          </Card>
        </Box>

        {/* Right Panel */}
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            height: 524,
            overflow: "hidden",
            width: "350px",
          }}
        >
          {/* Region Name Input - Shows when drawing/editing (not for rectangle mode) */}
          {(isDrawing || isEditMode) && !isRectangleMode && (
            <Card
              withBorder
              p="sm"
              radius="md"
              mb="sm"
              style={{
                backgroundColor:
                  isDark 
                    ? theme.colors.dark?.[7] || theme.colors.gray[8] 
                    : theme.white,
                flexShrink: 0,
              }}
            >
              <Stack gap="sm">
                <TextInput
                  label="Region Name"
                  value={regionName}
                  onChange={(e) => {
                    setRegionName(e.currentTarget.value);
                    setShowNameError(false);
                  }}
                  placeholder="Enter region name"
                  size="sm"
                  error={
                    showNameError
                      ? regionName.trim() === ""
                        ? "Region name is required"
                        : regions.some(
                              (r) =>
                                r.name.toLowerCase() ===
                                  regionName.trim().toLowerCase() &&
                                r.id !== editingRegion
                            )
                          ? "Region name already exists"
                          : null
                      : null
                  }
                />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Points:{" "}
                    {isEditMode ? editablePoints.length : currentPoints.length}
                  </Text>
                  {isDrawing && currentPoints.length > 0 && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => setCurrentPoints([])}
                    >
                      Clear points
                    </Button>
                  )}
                </Group>
              </Stack>
            </Card>
          )}

          {/* ROI Status Card - Shows for rectangle mode */}
          {isRectangleMode && (isDrawing || regions.length > 0) && (
            <Card
              withBorder
              p="sm"
              radius="md"
              mb="sm"
              style={{
                backgroundColor:
                  isDark 
                    ? theme.colors.dark?.[7] || theme.colors.gray[8] 
                    : theme.white,
                flexShrink: 0,
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" fw={600}>
                    Detection Area (ROI)
                  </Text>
                  {regions.length > 0 && (
                    <Badge color="green" size="sm">
                      Configured
                    </Badge>
                  )}
                </Group>
                {isDrawing && (
                  <Text size="xs" c="dimmed">
                    {currentPoints.length === 0
                      ? "Click to set first corner"
                      : currentPoints.length < 4
                        ? "Click to set second corner"
                        : "Rectangle complete"}
                  </Text>
                )}
                {regions.length > 0 && !isDrawing && formValues.roi && (
                  <>
                    <Divider />
                    <Group gap="xs">
                      <Box>
                        <Text size="xs" c="dimmed">
                          Position
                        </Text>
                        <Text size="sm" fw={500}>
                          ({Math.round(formValues.roi.x1)},{" "}
                          {Math.round(formValues.roi.y1)})
                        </Text>
                      </Box>
                      <Box>
                        <Text size="xs" c="dimmed">
                          Size
                        </Text>
                        <Text size="sm" fw={500}>
                          {Math.round(
                            Math.abs(formValues.roi.x2 - formValues.roi.x1)
                          )}{" "}
                          ×{" "}
                          {Math.round(
                            Math.abs(formValues.roi.y2 - formValues.roi.y1)
                          )}{" "}
                          px
                        </Text>
                      </Box>
                    </Group>
                    <Divider />
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<Icons.Trash size={14} />}
                        onClick={() => {
                          regions.forEach((r) => deleteRegion(r.id));
                          setROI(undefined);
                        }}
                        fullWidth
                      >
                        Clear
                      </Button>
                    </Group>
                  </>
                )}
              </Stack>
            </Card>
          )}

          {/* Tabs for Regions and Connections - Hide for rectangle mode */}
          {!isRectangleMode && (
            <Card
              withBorder
              p="sm"
              radius="md"
              style={{
                backgroundColor:
                  isDark 
                    ? theme.colors.dark?.[7] || theme.colors.gray[8] 
                    : theme.white,
                display: "flex",
                flex: 1,
                flexDirection: "column",
                minHeight: 200,
                overflow: "hidden",
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value || "regions")}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Tabs.List>
                  <Tabs.Tab
                    value="regions"
                    leftSection={
                      <Badge size="xs" variant="filled">
                        {regions.length}
                      </Badge>
                    }
                  >
                    Regions
                  </Tabs.Tab>
                  <Tabs.Tab
                    value="connections"
                    leftSection={
                      <Badge size="xs" variant="filled" color="green">
                        {connections.length}
                      </Badge>
                    }
                  >
                    Connections
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel
                  value="regions"
                  pt="sm"
                  style={{ height: "calc(100% - 40px)", overflow: "hidden" }}
                >
                  <ScrollArea
                    style={{ height: "100%" }}
                    scrollbarSize={8}
                    type="scroll"
                  >
                    {regions.length === 0 ? (
                      <Center p="xl">
                        <Stack align="center" gap="xs">
                          <Icons.Polygon size={30} opacity={0.3} />
                          <Text size="sm" c="dimmed">
                            No regions yet
                          </Text>
                        </Stack>
                      </Center>
                    ) : (
                      <Stack gap="xs">
                        {regions.map((region) => {
                          const hasConnections = connections.some(
                            (conn) =>
                              conn.sourceId === region.id ||
                              conn.destinationId === region.id
                          );

                          return (
                            <Paper
                              key={region.id}
                              p="xs"
                              withBorder
                              radius="sm"
                              style={{
                                borderLeft: `3px solid ${getRegionColor(region.id)}`,
                              }}
                            >
                              <Group justify="space-between">
                                <Group gap="xs">
                                  <Box
                                    style={{
                                      backgroundColor: getRegionColor(
                                        region.id
                                      ),
                                      borderRadius: "50%",
                                      height: 12,
                                      width: 12,
                                    }}
                                  />
                                  <Text size="sm" fw={500}>
                                    {region.name}
                                  </Text>
                                  {hasConnections && (
                                    <Badge
                                      size="xs"
                                      color="green"
                                      variant="dot"
                                    >
                                      Connected
                                    </Badge>
                                  )}
                                </Group>
                                {!isRectangleMode && (
                                  <Group gap={4}>
                                    <Tooltip label="Edit">
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        onClick={() => handleEditRegion(region)}
                                      >
                                        <Icons.Edit size={14} />
                                      </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Delete">
                                      <ActionIcon
                                        size="sm"
                                        variant="subtle"
                                        color="red"
                                        onClick={() =>
                                          handleDeleteRegion(region.id)
                                        }
                                      >
                                        <Icons.Trash size={14} />
                                      </ActionIcon>
                                    </Tooltip>
                                  </Group>
                                )}
                              </Group>
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                  </ScrollArea>
                </Tabs.Panel>

                <Tabs.Panel
                  value="connections"
                  pt="sm"
                  style={{ height: "calc(100% - 40px)", overflow: "hidden" }}
                >
                  <Stack
                    gap="sm"
                    style={{ height: "100%", overflow: "hidden" }}
                  >
                    {/* Connection creator */}
                    {regions.length >= 2 && (
                      <Card
                        p="xs"
                        withBorder
                        radius="sm"
                        style={{
                          backgroundColor:
                            isDark
                              ? theme.colors.gray[9]
                              : theme.colors.gray[0],
                          flexShrink: 0,
                        }}
                      >
                        <Stack gap="xs">
                          <Text
                            size="xs"
                            fw={600}
                            c={isDark ? "gray.4" : "gray.7"}
                          >
                            Create Connection
                          </Text>
                          <Group gap="xs" align="center">
                            <Select
                              placeholder="From"
                              size="xs"
                              value={sourceRegionId}
                              onChange={(value) => {
                                setSourceRegionId(value);
                                setConnectionError(null);
                              }}
                              data={regions.map((r) => ({
                                label: r.name,
                                value: r.id,
                              }))}
                              style={{ flex: 1 }}
                              searchable
                              clearable
                            />
                            <Icons.ArrowRight
                              size={14}
                              color={theme.colors.green[5]}
                            />
                            <Select
                              placeholder="To"
                              size="xs"
                              value={destinationRegionId}
                              onChange={(value) => {
                                setDestinationRegionId(value);
                                setConnectionError(null);
                              }}
                              data={regions
                                .filter((r) => r.id !== sourceRegionId)
                                .map((r) => ({ label: r.name, value: r.id }))}
                              disabled={!sourceRegionId}
                              style={{ flex: 1 }}
                              searchable
                              clearable
                            />
                            <Button
                              size="xs"
                              disabled={!sourceRegionId || !destinationRegionId}
                              onClick={handleSaveDirection}
                              color="green"
                            >
                              Add
                            </Button>
                          </Group>
                          {connectionError && (
                            <Text size="xs" c="red">
                              {connectionError}
                            </Text>
                          )}
                        </Stack>
                      </Card>
                    )}

                    <ScrollArea
                      style={{ flex: 1, minHeight: 0 }}
                      scrollbarSize={8}
                      type="scroll"
                    >
                      {connections.length === 0 ? (
                        <Center p="xl">
                          <Stack align="center" gap="xs">
                            <Icons.ArrowRight size={30} opacity={0.3} />
                            <Text size="sm" c="dimmed">
                              {regions.length < 2
                                ? "Need 2+ regions"
                                : "No connections yet"}
                            </Text>
                          </Stack>
                        </Center>
                      ) : (
                        <Stack gap="xs">
                          {connections.map((conn) => {
                            const source = regions.find(
                              (r) => r.id === conn.sourceId
                            );
                            const dest = regions.find(
                              (r) => r.id === conn.destinationId
                            );

                            return (
                              <Paper
                                key={conn.id}
                                p="xs"
                                withBorder
                                radius="sm"
                                onMouseEnter={() =>
                                  setHoveredConnection(conn.id)
                                }
                                onMouseLeave={() => setHoveredConnection(null)}
                                style={{
                                  backgroundColor:
                                    hoveredConnection === conn.id
                                      ? isDark
                                        ? theme.colors.green[9] + "20"
                                        : theme.colors.green[0]
                                      : undefined,
                                  borderColor:
                                    hoveredConnection === conn.id
                                      ? theme.colors.green[5]
                                      : undefined,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <Box
                                      style={{
                                        backgroundColor: getRegionColor(
                                          conn.sourceId
                                        ),
                                        borderRadius: "50%",
                                        height: 10,
                                        width: 10,
                                      }}
                                    />
                                    <Text size="xs" fw={500}>
                                      {source?.name}
                                    </Text>
                                    <Icons.ArrowRight
                                      size={12}
                                      color={theme.colors.green[5]}
                                    />
                                    <Box
                                      style={{
                                        backgroundColor: getRegionColor(
                                          conn.destinationId
                                        ),
                                        borderRadius: "50%",
                                        height: 10,
                                        width: 10,
                                      }}
                                    />
                                    <Text size="xs" fw={500}>
                                      {dest?.name}
                                    </Text>
                                  </Group>
                                  <Tooltip label="Delete">
                                    <ActionIcon
                                      size="sm"
                                      variant="subtle"
                                      color="red"
                                      onClick={() => {
                                        const newConnections =
                                          connections.filter(
                                            (c) => c.id !== conn.id
                                          );
                                        setConnections(newConnections);
                                        updateConnections(newConnections);
                                      }}
                                    >
                                      <Icons.Trash size={14} />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>
                              </Paper>
                            );
                          })}
                        </Stack>
                      )}
                    </ScrollArea>
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>
          )}
        </Box>
      </Flex>

      {/* Delete Region Modal */}
      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("recipes:region.deleteTitle", "Delete Region?")}
        centered
        size="sm"
        styles={{
          content: {
            backgroundColor: isDark 
              ? theme.colors.dark?.[7] || theme.colors.gray[9] 
              : theme.white,
          },
          header: {
            backgroundColor: isDark 
              ? theme.colors.dark?.[7] || theme.colors.gray[9] 
              : theme.white,
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            {regionToDelete && (
              <>
                {t(
                  "recipes:region.deleteMessage",
                  "Are you sure you want to delete the region"
                )}{" "}
                <Text
                  component="span"
                  fw={600}
                  c={isDark ? "white" : "dark"}
                >
                  "{regionToDelete.name}"
                </Text>
                ?
                {regionToDelete.connections.length > 0 && (
                  <>
                    {" "}
                    {t(
                      "recipes:region.deleteConnectionsWarning",
                      "This will also remove"
                    )}{" "}
                    <Text component="span" fw={600} c="orange">
                      {regionToDelete.connections.length} connection(s)
                    </Text>
                    .
                  </>
                )}
              </>
            )}
          </Text>
          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              style={{
                borderColor:
                  isDark
                    ? theme.colors.dark[4]
                    : theme.colors.gray[4],
                color:
                  isDark
                    ? theme.colors.gray[3]
                    : theme.colors.gray[7],
              }}
            >
              {t("common:button.cancel", "Cancel")}
            </Button>
            <Button
              onClick={() => {
                performRegionDeletion(regionToDelete!.id);
                setShowDeleteModal(false);
              }}
              style={{
                "&:hover": {
                  backgroundColor: theme.colors.red[7],
                },
                backgroundColor: theme.colors.red[6],
              }}
            >
              {t("recipes:region.deleteConfirm", "Delete Region")}
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Change Road Type Modal */}
      <Modal
        opened={showRoadTypeModal}
        onClose={() => setShowRoadTypeModal(false)}
        title={t("recipes:region.changeRoadTypeTitle", "Change Road Type?")}
        centered
        size="sm"
        styles={{
          content: {
            backgroundColor: isDark 
              ? theme.colors.dark?.[7] || theme.colors.gray[9] 
              : theme.white,
          },
          header: {
            backgroundColor: isDark 
              ? theme.colors.dark?.[7] || theme.colors.gray[9] 
              : theme.white,
          },
        }}
      >
        <Stack gap="md">
          <Text size="sm">
            {t(
              "recipes:region.changeRoadTypeMessage",
              "Changing the road type will remove all existing regions and connections. Are you sure you want to continue?"
            )}
          </Text>
          {(regions.length > 0 || connections.length > 0) && (
            <Text size="sm" c="dimmed">
              {t("recipes:region.changeRoadTypeWarning", "This will delete")}{" "}
              <Text component="span" fw={600} c="orange">
                {regions.length} region(s)
              </Text>{" "}
              and{" "}
              <Text component="span" fw={600} c="orange">
                {connections.length} connection(s)
              </Text>
              .
            </Text>
          )}
          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={() => setShowRoadTypeModal(false)}
              style={{
                borderColor:
                  isDark
                    ? theme.colors.dark[4]
                    : theme.colors.gray[4],
                color:
                  isDark
                    ? theme.colors.gray[3]
                    : theme.colors.gray[7],
              }}
            >
              {t("common:button.cancel", "Cancel")}
            </Button>
            <Button
              onClick={confirmRoadTypeChange}
              style={{
                "&:hover": {
                  backgroundColor: theme.colors.red[7],
                },
                backgroundColor: theme.colors.red[6],
              }}
            >
              {t("recipes:region.changeRoadTypeConfirm", "Change Road Type")}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
}

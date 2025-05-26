import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Button,
  Paper,
  TextInput,
  ActionIcon,
  ScrollArea,
  Box,
  Card,
  Title,
  SimpleGrid,
  UnstyledButton,
  Center,
  Select,
  Modal,
  Tabs,
  useMantineTheme,
  Badge,
  Flex,
  Collapse,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useTheme } from "../../../providers/theme-provider";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconArrowRight,
  IconPolygon,
  IconChevronDown,
  IconInfoCircle,
} from "@tabler/icons-react";
import { v4 as uuidv4 } from "uuid";
import {
  Stage,
  Layer,
  Line,
  Circle,
  Rect,
  Image as KonvaImage,
} from "react-konva";
import { useRecipeStore } from "../../../lib/store/recipe-store";
import type {
  Region,
  RegionPoint,
  FrameData,
  RoadType,
  RegionConnection,
} from "../../../types/recipe";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import useImage from "use-image";
import { RoadTypeIcon } from "../../road-config/road-type-icon";

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
  } = useRecipeStore();
  const mantineTheme = useMantineTheme();
  const { theme, colorScheme } = useTheme();

  // Use the same dimensions as task-type-with-video-step
  const STAGE_WIDTH = 600;
  const STAGE_HEIGHT = 400;

  const [videoSize] = useState({ width: STAGE_WIDTH, height: STAGE_HEIGHT });

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
  }, []); // Only run once on mount
  const getThemeColor = (colorPath: string): string => {
    const [colorName, index] = colorPath.split(".");
    if (colorName === "ui") {
      return theme.other?.ui?.[index] || colorPath;
    }
    if (colorName === "backgrounds") {
      return theme.other?.backgrounds?.[index] || colorPath;
    }
    if (colorName === "regionColors") {
      const path = theme.other?.regionColors?.[index];
      if (path) {
        return getThemeColor(path);
      }
      return colorPath;
    }
    return theme.colors?.[colorName]?.[Number(index)] || colorPath;
  };

  // Region colors
  const REGION_COLORS = theme.other?.regionPalette || [
    "red.5",
    "green.5",
    "yellow.7",
    "indigo.5",
  ];

  const getRegionColor = (regionId: string) => {
    const regionIndex = regions.findIndex((r) => r.id === regionId);
    if (regionIndex === -1) {
      const colorPath = REGION_COLORS[regions.length % REGION_COLORS.length];
      return getThemeColor(colorPath);
    }
    const colorPath = REGION_COLORS[regionIndex % REGION_COLORS.length];
    return getThemeColor(colorPath);
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
    { value: "straight", label: t("recipes:roadType.straight", "Straight") },
    {
      value: "tJunction",
      label: t("recipes:roadType.tJunction", "T-Junction"),
    },
    {
      value: "crossroads",
      label: t("recipes:roadType.crossroads", "Crossroads"),
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

  const handleStageMouseMove = () => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (pointer) {
      setMousePos({ x: pointer.x, y: pointer.y });
    }

    if (isDraggingRegion) {
      handleStageMouseMoveForDrag(e);
    }
  };

  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (isDraggingRegion) return;
    if (isEditMode) return;
    if (!isDrawing) return;

    const stage = stageRef.current;
    if (!stage) return;
    const point = stage.getPointerPosition();

    if (point) {
      setCurrentPoints([...currentPoints, { x: point.x, y: point.y }]);
    }
  };

  const handleAddRegion = () => {
    setSelectedRegion(null);
    setEditingRegion(null);
    setIsDrawing(true);
    setCurrentPoints([]);
    setIsEditMode(false);
  };

  const handleSaveRegion = () => {
    if (currentPoints.length < 3) {
      return;
    }

    if (editingRegion) {
      const updatedRegion: Region = {
        id: editingRegion,
        name: regionName || `Region ${regions.length + 1}`,
        points: currentPoints,
        roadType: roadType,
      };
      updateRegion(updatedRegion);
    } else {
      const newRegion: Region = {
        id: uuidv4(),
        name: regionName || `Region ${regions.length + 1}`,
        points: currentPoints,
        roadType: roadType,
      };
      addRegion(newRegion);
    }

    setIsDrawing(false);
    setCurrentPoints([]);
    setRegionName("");
    setEditingRegion(null);
    setSelectedRegion(null);
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
  };

  const handleSaveEdit = () => {
    if (editingRegion && editablePoints.length >= 3) {
      const updatedRegion: Region = {
        id: editingRegion,
        name: regionName || `Region ${regions.length + 1}`,
        points: editablePoints,
        roadType: roadType,
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
  };

  const handleDeleteRegion = (regionId: string) => {
    const regionConnections = connections.filter(
      (conn) => conn.sourceId === regionId || conn.destinationId === regionId
    );

    if (regionConnections.length > 0) {
      const regionName =
        regions.find((r) => r.id === regionId)?.name || "Unknown Region";
      setRegionToDelete({
        id: regionId,
        name: regionName,
        connections: regionConnections,
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

      if (!alreadyExists) {
        const newConnections = [
          ...connections,
          {
            id: uuidv4(),
            sourceId: sourceRegionId,
            destinationId: destinationRegionId,
          },
        ];
        setConnections(newConnections);
        updateConnections(newConnections);
      }

      setSourceRegionId(null);
      setDestinationRegionId(null);
    }
  };

  return (
    <Box
      style={{
        backgroundColor:
          colorScheme === "dark"
            ? getThemeColor("gray.9")
            : getThemeColor("gray.0"),
        minHeight: "100vh",
        padding: "0.5rem",
      }}
    >
      {/* Compact Header */}
      <Box px="md" pb="sm">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <IconPolygon
              size={20}
              color={getThemeColor(`${mantineTheme.primaryColor}.6`)}
            />
            <Title order={4}>{t("recipes:creation.regionSetup.title")}</Title>
            <Badge
              size="sm"
              variant={colorScheme === "dark" ? "filled" : "light"}
            >
              {regions.length} regions • {connections.length} connections
            </Badge>
          </Group>

          {/* Road Type Selector Button */}
          <Button
            variant="subtle"
            size="sm"
            rightSection={
              <IconChevronDown
                size={16}
                style={{
                  transform: roadTypeSelectorOpened ? "rotate(180deg)" : "none",
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
        </Group>
      </Box>

      {/* Collapsible Road Type Selector */}
      <Collapse in={roadTypeSelectorOpened}>
        <Box px="md" pb="md">
          <Card
            withBorder
            p="sm"
            radius="md"
            style={{
              backgroundColor:
                colorScheme === "dark" ? getThemeColor("gray.8") : "white",
            }}
          >
            <SimpleGrid cols={{ base: 3 }} spacing="sm">
              {roadTypeOptions.map((option) => (
                <UnstyledButton
                  key={option.value}
                  p="sm"
                  style={{
                    border: `2px solid ${roadType === option.value ? getThemeColor(`${mantineTheme.primaryColor}.5`) : getThemeColor("ui.border")}`,
                    borderRadius: getThemeColor("ui.borderRadius"),
                    backgroundColor:
                      roadType === option.value
                        ? colorScheme === "dark"
                          ? `${getThemeColor(`${mantineTheme.primaryColor}.8`)}40`
                          : `${getThemeColor(`${mantineTheme.primaryColor}.5`)}15`
                        : "transparent",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleRoadTypeChange(option.value)}
                >
                  <Center>
                    <Stack gap="xs" align="center">
                      <RoadTypeIcon type={option.value} size={60} />
                      <Text size="xs" fw={500}>
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

      {/* Main Content - Side by side layout */}
      <Flex
        gap="md"
        px="md"
        style={{
          height: `calc(100vh - ${roadTypeSelectorOpened ? "200px" : "80px"})`,
        }}
      >
        {/* Left Panel - Canvas */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Card
            withBorder
            p="sm"
            radius="md"
            style={{
              backgroundColor:
                colorScheme === "dark" ? getThemeColor("gray.8") : "white",
              height: "100%",
            }}
          >
            <Stack gap="sm" style={{ height: "100%" }}>
              {/* Canvas Header */}
              <Group justify="space-between" align="center">
                <Text size="sm" fw={500}>
                  Canvas
                </Text>
                <Group gap="xs">
                  {!isDrawing && !isEditMode && (
                    <Button
                      leftSection={<IconPlus size={14} />}
                      onClick={handleAddRegion}
                      size="xs"
                      variant="filled"
                    >
                      Add Region
                    </Button>
                  )}
                  {isDrawing && !isEditMode && (
                    <>
                      <Button
                        variant="subtle"
                        color="red"
                        onClick={handleCancelEdit}
                        size="xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={currentPoints.length < 3}
                        onClick={handleSaveRegion}
                        size="xs"
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
                        size="xs"
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit} size="xs">
                        Save Changes
                      </Button>
                    </>
                  )}
                </Group>
              </Group>

              {/* Canvas */}
              <Box
                style={{
                  flex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor:
                    colorScheme === "dark"
                      ? getThemeColor("gray.9")
                      : getThemeColor("gray.1"),
                  borderRadius: getThemeColor("ui.borderRadius"),
                  position: "relative",
                  minHeight: "400px",
                  overflow: "hidden",
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
                      colorScheme === "dark"
                        ? getThemeColor("gray.9")
                        : "white",
                    borderRadius: getThemeColor("ui.borderRadius"),
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
                          colorScheme === "dark"
                            ? getThemeColor("gray.8")
                            : "white"
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
                                ? getThemeColor("green.5")
                                : getThemeColor("green.7")
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
                                ? getThemeColor("green.5")
                                : getThemeColor("green.7")
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
                                  colorScheme === "dark"
                                    ? getThemeColor("gray.4")
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
                              colorScheme === "dark"
                                ? getThemeColor("gray.4")
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
                        {/* Draw points for current region */}
                        {currentPoints.map((point, i) => (
                          <Circle
                            key={i}
                            x={point.x}
                            y={point.y}
                            radius={POINT_RADIUS}
                            fill={
                              colorScheme === "dark"
                                ? getThemeColor("gray.4")
                                : "white"
                            }
                            stroke={getRegionColor("new-region")}
                            strokeWidth={2}
                          />
                        ))}
                      </>
                    )}
                  </Layer>
                </Stage>

                {/* Hover label */}
                {showHoverLabel && (
                  <Box
                    style={{
                      position: "absolute",
                      left: mousePos.x + 10,
                      top: mousePos.y - 10,
                      backgroundColor:
                        colorScheme === "dark"
                          ? getThemeColor("gray.9") + "cc"
                          : getThemeColor("gray.7") + "cc",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: getThemeColor("ui.borderRadius"),
                      fontSize: "12px",
                      fontWeight: 500,
                      pointerEvents: "none",
                      zIndex: 1000,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {hoverLabelText}
                  </Box>
                )}
              </Box>

              {/* Instructions */}
              {(isDrawing || isEditMode) && (
                <Box
                  p="xs"
                  style={{
                    backgroundColor:
                      colorScheme === "dark"
                        ? getThemeColor("gray.9")
                        : getThemeColor("gray.0"),
                    borderRadius: getThemeColor("ui.borderRadius"),
                  }}
                >
                  <Group gap="xs">
                    <IconInfoCircle
                      size={14}
                      color={getThemeColor(`${mantineTheme.primaryColor}.5`)}
                    />
                    <Text
                      size="xs"
                      c={colorScheme === "dark" ? "gray.4" : "gray.6"}
                    >
                      {isDrawing
                        ? "Click to add points (min 3)"
                        : "Drag region to move, drag points to adjust"}
                    </Text>
                  </Group>
                </Box>
              )}
            </Stack>
          </Card>
        </Box>

        {/* Right Panel */}
        <Box style={{ width: "350px", flexShrink: 0 }}>
          {/* Region Name Input - Shows when drawing/editing */}
          {(isDrawing || isEditMode) && (
            <Card
              withBorder
              p="sm"
              radius="md"
              mb="sm"
              style={{
                backgroundColor:
                  colorScheme === "dark" ? getThemeColor("gray.8") : "white",
              }}
            >
              <Stack gap="sm">
                <TextInput
                  label="Region Name"
                  value={regionName}
                  onChange={(e) => setRegionName(e.currentTarget.value)}
                  placeholder={`Region ${regions.length + 1}`}
                  size="sm"
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

          {/* Tabs for Regions and Connections */}
          <Card
            withBorder
            p="sm"
            radius="md"
            style={{
              backgroundColor:
                colorScheme === "dark" ? getThemeColor("gray.8") : "white",
              height: `calc(100% - ${isDrawing || isEditMode ? "120px" : "0px"})`,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(value) => setActiveTab(value || "regions")}
              style={{ height: "100%" }}
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
                style={{ height: "calc(100% - 40px)" }}
              >
                <ScrollArea style={{ height: "100%" }}>
                  {regions.length === 0 ? (
                    <Center p="xl">
                      <Stack align="center" gap="xs">
                        <IconPolygon size={30} opacity={0.3} />
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
                                    width: 12,
                                    height: 12,
                                    borderRadius: "50%",
                                    backgroundColor: getRegionColor(region.id),
                                  }}
                                />
                                <Text size="sm" fw={500}>
                                  {region.name}
                                </Text>
                                {hasConnections && (
                                  <Badge size="xs" color="green" variant="dot">
                                    Connected
                                  </Badge>
                                )}
                              </Group>
                              <Group gap={4}>
                                <Tooltip label="Edit">
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    onClick={() => handleEditRegion(region)}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Delete">
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="red"
                                    onClick={() =>
                                      handleDeleteRegion(region.id)
                                    }
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
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
                style={{ height: "calc(100% - 40px)" }}
              >
                <Stack gap="sm" style={{ height: "100%" }}>
                  {/* Connection creator */}
                  {regions.length >= 2 && (
                    <Card
                      p="xs"
                      withBorder
                      radius="sm"
                      style={{
                        backgroundColor:
                          colorScheme === "dark"
                            ? getThemeColor("gray.9")
                            : getThemeColor("gray.0"),
                      }}
                    >
                      <Stack gap="xs">
                        <Text
                          size="xs"
                          fw={600}
                          c={colorScheme === "dark" ? "gray.4" : "gray.7"}
                        >
                          Create Connection
                        </Text>
                        <Group gap="xs" align="center">
                          <Select
                            placeholder="From"
                            size="xs"
                            value={sourceRegionId}
                            onChange={setSourceRegionId}
                            data={regions.map((r) => ({
                              value: r.id,
                              label: r.name,
                            }))}
                            style={{ flex: 1 }}
                            searchable
                            clearable
                          />
                          <IconArrowRight
                            size={14}
                            color={getThemeColor("green.5")}
                          />
                          <Select
                            placeholder="To"
                            size="xs"
                            value={destinationRegionId}
                            onChange={setDestinationRegionId}
                            data={regions
                              .filter((r) => r.id !== sourceRegionId)
                              .map((r) => ({ value: r.id, label: r.name }))}
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
                      </Stack>
                    </Card>
                  )}

                  <ScrollArea style={{ flex: 1 }}>
                    {connections.length === 0 ? (
                      <Center p="xl">
                        <Stack align="center" gap="xs">
                          <IconArrowRight size={30} opacity={0.3} />
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
                              onMouseEnter={() => setHoveredConnection(conn.id)}
                              onMouseLeave={() => setHoveredConnection(null)}
                              style={{
                                borderColor:
                                  hoveredConnection === conn.id
                                    ? getThemeColor("green.5")
                                    : undefined,
                                backgroundColor:
                                  hoveredConnection === conn.id
                                    ? colorScheme === "dark"
                                      ? getThemeColor("green.9") + "20"
                                      : getThemeColor("green.0")
                                    : undefined,
                                transition: "all 0.2s ease",
                              }}
                            >
                              <Group justify="space-between">
                                <Group gap="xs">
                                  <Box
                                    style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      backgroundColor: getRegionColor(
                                        conn.sourceId
                                      ),
                                    }}
                                  />
                                  <Text size="xs" fw={500}>
                                    {source?.name}
                                  </Text>
                                  <IconArrowRight
                                    size={12}
                                    color={getThemeColor("green.5")}
                                  />
                                  <Box
                                    style={{
                                      width: 10,
                                      height: 10,
                                      borderRadius: "50%",
                                      backgroundColor: getRegionColor(
                                        conn.destinationId
                                      ),
                                    }}
                                  />
                                  <Text size="xs" fw={500}>
                                    {dest?.name}
                                  </Text>
                                </Group>
                                <Tooltip label="Delete">
                                  <ActionIcon
                                    size="xs"
                                    variant="subtle"
                                    color="red"
                                    onClick={() => {
                                      const newConnections = connections.filter(
                                        (c) => c.id !== conn.id
                                      );
                                      setConnections(newConnections);
                                      updateConnections(newConnections);
                                    }}
                                  >
                                    <IconTrash size={14} />
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
        </Box>
      </Flex>

      {/* Modals */}
      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Region"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            The region "<strong>{regionToDelete?.name}</strong>" has{" "}
            {regionToDelete?.connections.length} connection(s). Deleting this
            region will also remove all its connections.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              color="red"
              size="sm"
              onClick={() => {
                performRegionDeletion(regionToDelete!.id);
                setShowDeleteModal(false);
              }}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={showRoadTypeModal}
        onClose={() => setShowRoadTypeModal(false)}
        title="Change Road Type"
        centered
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Changing the road type will remove all existing regions (
            {regions.length}) and connections ({connections.length}).
          </Text>
          <Group justify="flex-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoadTypeModal(false)}
            >
              Cancel
            </Button>
            <Button color="red" size="sm" onClick={confirmRoadTypeChange}>
              Change
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

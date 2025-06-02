import type { Recipe } from "@/types/task-creation";

// Helper function to generate more mock recipes
function generateAdditionalRecipes(): Recipe[] {
  const additionalRecipes: Recipe[] = [];
  
  // Generate more traffic statistics recipes
  for (let i = 7; i <= 25; i++) {
    additionalRecipes.push({
      confidenceThreshold: 0.7 + (i % 3) * 0.05,
      createdAt: new Date(2024, 0, i).toISOString(),
      description: `用於特定場景的交通流量統計方案 ${i}`,
      id: `recipe-${i}`,
      modelId: i % 2 === 0 ? "yolov8-traffic" : "yolov8-highway",
      name: `交通監測方案 ${i}`,
      regions: [
        {
          id: `region-${i * 2 - 1}`,
          name: `監測區域 A-${i}`,
          points: [
            { x: 100 + (i * 10) % 200, y: 200 + (i * 5) % 100 },
            { x: 500 + (i * 10) % 200, y: 200 + (i * 5) % 100 },
          ],
        },
        {
          id: `region-${i * 2}`,
          name: `監測區域 B-${i}`,
          points: [
            { x: 100 + (i * 10) % 200, y: 350 + (i * 5) % 100 },
            { x: 500 + (i * 10) % 200, y: 350 + (i * 5) % 100 },
          ],
        },
      ],
      status: i % 3 === 0 ? "inactive" : "active",
      taskType: "trafficStatistics",
    });
  }
  
  // Generate more train detection recipes
  for (let i = 26; i <= 40; i++) {
    additionalRecipes.push({
      confidenceThreshold: 0.85 + (i % 4) * 0.03,
      createdAt: new Date(2024, 1, i - 25).toISOString(),
      description: `鐵路系統列車監測方案 ${i - 25}`,
      id: `recipe-${i}`,
      modelId: i % 3 === 0 ? "yolov8-hsr" : "yolov8-train",
      name: `列車偵測方案 ${i - 25}`,
      regions: [
        {
          id: `region-${i * 2}`,
          name: `軌道區域 ${i - 25}`,
          points: [
            { x: 150 + (i * 15) % 100, y: 200 },
            { x: 650 - (i * 15) % 100, y: 200 },
            { x: 650 - (i * 15) % 100, y: 450 },
            { x: 150 + (i * 15) % 100, y: 450 },
          ],
        },
      ],
      status: i % 4 === 0 ? "inactive" : "active",
      taskType: "trainDetection",
    });
  }
  
  return additionalRecipes;
}

export const mockRecipes: Recipe[] = [
  // Traffic Statistics Recipes
  {
    confidenceThreshold: 0.7,
    createdAt: "2024-01-15T08:00:00Z",
    description: "用於監測市區主要道路的車流量統計",
    id: "recipe-1",
    modelId: "yolov8-traffic",
    name: "市區主幹道交通流量監測",
    regions: [
      {
        id: "region-1",
        name: "北向計數線",
        points: [
          { x: 100, y: 300 },
          { x: 700, y: 300 },
        ],
      },
      {
        id: "region-2",
        name: "南向計數線",
        points: [
          { x: 100, y: 400 },
          { x: 700, y: 400 },
        ],
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
  },
  {
    confidenceThreshold: 0.75,
    createdAt: "2024-01-20T10:30:00Z",
    description: "複雜十字路口的多向車流統計分析",
    id: "recipe-2",
    modelId: "yolov8-traffic",
    name: "十字路口車流分析",
    regions: [
      {
        id: "region-3",
        name: "東西向計數區",
        points: [
          { x: 200, y: 200 },
          { x: 600, y: 200 },
          { x: 600, y: 300 },
          { x: 200, y: 300 },
        ],
      },
      {
        id: "region-4",
        name: "南北向計數區",
        points: [
          { x: 350, y: 100 },
          { x: 450, y: 100 },
          { x: 450, y: 500 },
          { x: 350, y: 500 },
        ],
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
  },
  {
    confidenceThreshold: 0.8,
    createdAt: "2024-02-01T14:00:00Z",
    description: "高速公路多車道車流量即時統計",
    id: "recipe-3",
    modelId: "yolov8-highway",
    name: "高速公路車流監測",
    regions: [
      {
        id: "region-5",
        name: "車道1",
        points: [
          { x: 50, y: 350 },
          { x: 250, y: 350 },
        ],
      },
      {
        id: "region-6",
        name: "車道2",
        points: [
          { x: 260, y: 350 },
          { x: 460, y: 350 },
        ],
      },
      {
        id: "region-7",
        name: "車道3",
        points: [
          { x: 470, y: 350 },
          { x: 670, y: 350 },
        ],
      },
    ],
    status: "active",
    taskType: "trafficStatistics",
  },

  // Train Detection Recipes
  {
    confidenceThreshold: 0.85,
    createdAt: "2024-01-25T09:00:00Z",
    description: "監測列車進出站狀態及停靠時間",
    id: "recipe-4",
    modelId: "yolov8-train",
    name: "台北車站月台監測",
    regions: [
      {
        id: "region-8",
        name: "月台區域",
        points: [
          { x: 100, y: 200 },
          { x: 700, y: 200 },
          { x: 700, y: 500 },
          { x: 100, y: 500 },
        ],
      },
    ],
    status: "active",
    taskType: "trainDetection",
  },
  {
    confidenceThreshold: 0.9,
    createdAt: "2024-02-05T11:30:00Z",
    description: "偵測平交道區域的列車通過情況",
    id: "recipe-5",
    modelId: "yolov8-train",
    name: "鐵路平交道安全監測",
    regions: [
      {
        id: "region-9",
        name: "平交道偵測區",
        points: [
          { x: 150, y: 250 },
          { x: 650, y: 250 },
          { x: 650, y: 450 },
          { x: 150, y: 450 },
        ],
      },
    ],
    status: "active",
    taskType: "trainDetection",
  },
  {
    confidenceThreshold: 0.88,
    createdAt: "2024-01-18T13:45:00Z",
    description: "監測高速鐵路隧道進出口的列車狀態",
    id: "recipe-6",
    modelId: "yolov8-hsr",
    name: "高鐵隧道監測系統",
    regions: [
      {
        id: "region-10",
        name: "隧道入口",
        points: [
          { x: 200, y: 150 },
          { x: 600, y: 150 },
          { x: 600, y: 550 },
          { x: 200, y: 550 },
        ],
      },
    ],
    status: "inactive",
    taskType: "trainDetection",
  },
  
  // Add generated recipes to simulate many recipes
  ...generateAdditionalRecipes(),
];

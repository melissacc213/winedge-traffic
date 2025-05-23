import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';
import type { ModelConfig, ModelLabel, ModelParseResult } from '@/types/model';

export class ModelParser {
  static async parseModelZip(file: File): Promise<ModelParseResult> {
    try {
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(file);
      
      // Extract model.label file
      const labelFile = zipContent.file('cfg/model.label');
      const configFile = zipContent.file('cfg/model_info.json');
      
      if (!labelFile || !configFile) {
        return {
          success: false,
          error: 'Missing required files (model.label or model_info.json) in zip archive'
        };
      }
      
      // Parse label file
      const labelContent = await labelFile.async('text');
      const labels = labelContent
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      // Parse config file
      const configContent = await configFile.async('text');
      const configJson = JSON.parse(configContent);
      
      // Create model config with defaults
      const modelConfig: ModelConfig = {
        id: configJson.id,
        name: configJson.name || 'Imported Model',
        description: configJson.description || '',
        created_time: configJson.created_time,
        updated_time: configJson.updated_time,
        task: configJson.task || 'object_detection',
        algorithm: configJson.algorithm,
        deployment: configJson.deployment,
        labels: this.mergeLabelsWithConfig(labels, configJson.labels)
      };
      
      return {
        success: true,
        config: modelConfig,
        labelFile: labels
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to parse model zip: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  private static mergeLabelsWithConfig(labelNames: string[], configLabels?: any[]): ModelLabel[] {
    const labelMap = new Map<string, any>();
    
    // Create map from config labels if they exist
    if (configLabels) {
      configLabels.forEach(label => {
        labelMap.set(label.name, label);
      });
    }
    
    // Merge label names with config data
    return labelNames.map((name, index) => {
      const configLabel = labelMap.get(name);
      
      return {
        id: uuidv4(),
        name,
        color: configLabel?.color || this.generateDefaultColor(index),
        confidence: configLabel?.confidence || 0.5,
        width_threshold: configLabel?.width_threshold || 32,
        height_threshold: configLabel?.height_threshold || 32,
        enabled: configLabel?.enabled !== false
      };
    });
  }
  
  private static generateDefaultColor(index: number): string {
    // Generate a diverse set of colors using HSL
    const hue = (index * 137.508) % 360; // Golden angle approximation
    const saturation = 70 + (index % 3) * 10; // 70%, 80%, 90%
    const lightness = 45 + (index % 2) * 10; // 45%, 55%
    
    return this.hslToHex(hue, saturation, lightness);
  }
  
  private static hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
  
  static exportModelConfig(config: ModelConfig): { labelFile: string; configFile: string } {
    // Generate label file content
    const labelFile = config.labels
      .filter(label => label.enabled !== false)
      .map(label => label.name)
      .join('\n') + '\n';
    
    // Generate config file content
    const configFile = JSON.stringify({
      ...config,
      labels: config.labels.map(label => ({
        name: label.name,
        color: label.color,
        confidence: label.confidence,
        width_threshold: label.width_threshold,
        height_threshold: label.height_threshold,
        enabled: label.enabled
      }))
    }, null, 2);
    
    return { labelFile, configFile };
  }
}
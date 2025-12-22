import { View } from "../View";
import { Text } from "../Text";
import { Input } from "../Input";
import { Button } from "../Button";
import Select from "../Select";
import { layoutStyles, spacing, colors } from "../../styles";
import { AssetCondition } from "../../types/asset";
import { RoadSurfaceType, TrafficVolume } from "../../types/road";
import type { CreateRoadArgs } from "../../services/ai/toolSchemas";
import {
  RoadDraftFields,
  validateRoadDraftForCreate,
  normalizeCondition,
  normalizeSurfaceType,
  normalizeTrafficVolume,
} from "../../services/ai/draftRoad";

interface DraftRoadFormProps {
  fields: RoadDraftFields;
  onChangeField: (key: keyof CreateRoadArgs, value: unknown) => void;
  onToggleOptional: () => void;
  showOptional: boolean;
  onCreate: () => void;
  disabled?: boolean;
}

export default function DraftRoadForm({
  fields,
  onChangeField,
  onToggleOptional,
  showOptional,
  onCreate,
  disabled,
}: DraftRoadFormProps) {
  const validation = validateRoadDraftForCreate(fields);

  return (
    <View card style={[layoutStyles.mt3]}>
      <View row spaceBetween style={[layoutStyles.mb2]}>
        <Text variant="h4">Draft road details</Text>
        <Button variant="secondary" size="small" onPress={onToggleOptional} disabled={disabled}>
          {showOptional ? "Hide optional" : "Show optional"}
        </Button>
      </View>

      <Input
        label="Road Name *"
        value={String(fields.name ?? "")}
        onChangeText={(v) => onChangeField("name", v)}
        error={validation.errors.name}
        placeholder="e.g., Cedar Lane"
        style={[layoutStyles.mb2]}
      />

      <View style={[layoutStyles.mb2]}>
        <Text style={[layoutStyles.mb1]} variant="bodySmall">
          Condition *
        </Text>
        <Select
          value={normalizeCondition(fields.condition)}
          onChange={(v) => onChangeField("condition", normalizeCondition(v) ?? v)}
          options={[
            { value: AssetCondition.GOOD, label: "Good" },
            { value: AssetCondition.FAIR, label: "Fair" },
            { value: AssetCondition.POOR, label: "Poor" },
          ]}
          placeholder="Select condition"
          disabled={disabled}
        />
        {validation.errors.condition ? (
          <Text variant="caption" style={{ color: colors.error.main, marginTop: spacing.xs }}>
            {validation.errors.condition}
          </Text>
        ) : null}
      </View>

      <View style={[layoutStyles.mb2]}>
        <Text style={[layoutStyles.mb1]} variant="bodySmall">
          Surface Type *
        </Text>
        <Select
          value={normalizeSurfaceType(fields.surfaceType)}
          onChange={(v) => onChangeField("surfaceType", normalizeSurfaceType(v) ?? v)}
          options={[
            { value: RoadSurfaceType.ASPHALT, label: "Asphalt" },
            { value: RoadSurfaceType.CONCRETE, label: "Concrete" },
            { value: RoadSurfaceType.GRAVEL, label: "Gravel" },
            { value: RoadSurfaceType.DIRT, label: "Dirt" },
            { value: RoadSurfaceType.PAVER, label: "Paver" },
            { value: RoadSurfaceType.OTHER, label: "Other" },
          ]}
          placeholder="Select surface type"
          disabled={disabled}
        />
        {validation.errors.surfaceType ? (
          <Text variant="caption" style={{ color: colors.error.main, marginTop: spacing.xs }}>
            {validation.errors.surfaceType}
          </Text>
        ) : null}
      </View>

      <View style={[layoutStyles.mb3]}>
        <Text style={[layoutStyles.mb1]} variant="bodySmall">
          Traffic Volume *
        </Text>
        <Select
          value={normalizeTrafficVolume(fields.trafficVolume)}
          onChange={(v) => onChangeField("trafficVolume", normalizeTrafficVolume(v) ?? v)}
          options={[
            { value: TrafficVolume.LOW, label: "Low" },
            { value: TrafficVolume.MEDIUM, label: "Medium" },
            { value: TrafficVolume.HIGH, label: "High" },
            { value: TrafficVolume.VERY_HIGH, label: "Very High" },
          ]}
          placeholder="Select traffic volume"
          disabled={disabled}
        />
        {validation.errors.trafficVolume ? (
          <Text variant="caption" style={{ color: colors.error.main, marginTop: spacing.xs }}>
            {validation.errors.trafficVolume}
          </Text>
        ) : null}
      </View>

      {showOptional && (
        <>
          <Input
            label="Location"
            value={String(fields.location ?? "")}
            onChangeText={(v) => onChangeField("location", v)}
            placeholder="Optional"
            style={[layoutStyles.mb2]}
          />

          <Input
            label="Notes"
            value={String(fields.notes ?? "")}
            onChangeText={(v) => onChangeField("notes", v)}
            placeholder="Optional"
            multiline
            numberOfLines={3}
            style={[layoutStyles.mb2]}
          />

          <View row style={[layoutStyles.mb2]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Length (m)"
                value={String(fields.length ?? "")}
                onChangeText={(v) => onChangeField("length", v.replace(/[^0-9.]/g, ""))}
                placeholder="Optional"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Width (m)"
                value={String(fields.width ?? "")}
                onChangeText={(v) => onChangeField("width", v.replace(/[^0-9.]/g, ""))}
                placeholder="Optional"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View row style={[layoutStyles.mb2]}>
            <View style={[layoutStyles.flex, layoutStyles.mr2]}>
              <Input
                label="Lanes"
                value={String(fields.lanes ?? "")}
                onChangeText={(v) => onChangeField("lanes", v.replace(/[^0-9]/g, ""))}
                placeholder="Optional"
                keyboardType="numeric"
              />
            </View>
            <View style={[layoutStyles.flex]}>
              <Input
                label="Speed Limit"
                value={String(fields.speedLimit ?? "")}
                onChangeText={(v) => onChangeField("speedLimit", v.replace(/[^0-9]/g, ""))}
                placeholder="Optional"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Input
            label="QR Tag ID"
            value={String(fields.qrTagId ?? "")}
            onChangeText={(v) => onChangeField("qrTagId", v)}
            placeholder="Optional"
            style={[layoutStyles.mb3]}
          />
        </>
      )}

      <Button
        onPress={onCreate}
        disabled={disabled || !validation.isValidForCreate}
      >
        Create from draft
      </Button>
    </View>
  );
}



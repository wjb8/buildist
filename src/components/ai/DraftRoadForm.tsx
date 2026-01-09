import { View } from "../View";
import { Text } from "../Text";
import { Input } from "../Input";
import { Button } from "../Button";
import Select from "../Select";
import { layoutStyles, spacing, colors } from "../../styles";
import { AssetCondition } from "../../types/asset";
import type { CreateRoadArgs } from "../../services/ai/toolSchemas";
import {
  RoadDraftFields,
  validateRoadDraftForCreate,
  normalizeCondition,
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

      <View style={[layoutStyles.mb3]}>
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



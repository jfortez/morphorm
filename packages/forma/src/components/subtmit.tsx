import { Spinner } from "./ui/spinner";

import { Button } from "./ui/button";
import { useFormContext } from "./ui/form";

export interface SubmitProps {
  submitText?: string | ((isSubmitting: boolean) => string | React.ReactNode);
  cancelText?: string;
  showCancelButton?: boolean;
  className?: string;
  handleCancel?: () => void;
}

export const SubmitButton = ({
  cancelText = "Cancel",
  className = "",
  showCancelButton = true,
  submitText: _subtmitText,
  handleCancel: _handleCancel,
}: SubmitProps) => {
  const form = useFormContext();

  const getSubmitText = (isSubmitting: boolean): React.ReactNode => {
    if (typeof _subtmitText === "function") {
      const result = _subtmitText(isSubmitting);
      return result;
    }
    if (_subtmitText) {
      return isSubmitting ? <Spinner /> : _subtmitText;
    }
    return isSubmitting ? <Spinner /> : "Submit";
  };

  const handleCancel = () => {
    form.reset();
    _handleCancel?.();
  };

  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ isSubmitting, canSubmit }) => (
          <div className={`forma-submit ${className}`.trim()}>
            {showCancelButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                {cancelText}
              </Button>
            )}
            <Button type="submit" disabled={!canSubmit}>
              {getSubmitText(isSubmitting)}
            </Button>
          </div>
        )}
    </form.Subscribe>
  );
};

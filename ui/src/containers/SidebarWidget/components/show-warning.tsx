import { Button } from "@contentstack/venus-components";
import { useApp } from "../store/store";

function ShowWarning() {
  const { canRefresh, reload, warningMessage } = useApp();

  return (
    <>
      <p>
        <strong>Note: </strong>
        {warningMessage}
      </p>

      <br />
      <Button
        isFullWidth={true}
        disabled={!canRefresh}
        icon={"Refresh"}
        buttonType="secondary"
        onClick={() => {
          reload();
        }}
      >
        Reload [{canRefresh}]
      </Button>
    </>
  );
}

export default ShowWarning;

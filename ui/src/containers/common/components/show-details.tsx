import { Button } from "@contentstack/venus-components";

interface IShowDetailsButtonProps {
  type: string;
  handler: () => void;
}

export const ShowDetailsButton = (props: IShowDetailsButtonProps) => {
  return (
    <Button onClick={props.handler} buttonType={props.type}>
      Details
    </Button>
  );
};

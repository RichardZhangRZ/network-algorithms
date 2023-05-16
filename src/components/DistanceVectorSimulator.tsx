import Canvas from "./Canvas";
import { useEffect, createRef, useRef, useCallback, useState } from "react";
import { DVNetwork } from "../classes/NetworkTopologies";
import {
  DVIdleState,
  AddDVRouterState,
  EditDVRouterState,
} from "../classes/DistanceVectorSimulatorStates";
import {
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { AddIcon, HamburgerIcon } from "@chakra-ui/icons";

function getMousePos(
  canvas: HTMLCanvasElement,
  clientPos: [number, number]
): [number, number] {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width, // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

  return [
    (clientPos[0] - rect.left) * scaleX, // scale mouse coordinates after they have
    (clientPos[1] - rect.top) * scaleY,
  ]; // been adjusted to be relative to element]
}

function bijectiveBase26(int: number) {
  const sequence = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const length = sequence.length;
  const last = sequence[sequence.length - 1];

  if (int <= length) return sequence[int - 1];

  let index = int % length || length;
  let result = [sequence[index - 1]];

  while ((int = Math.floor((int - 1) / length)) > 0) {
    index = int % length || length;
    result.push(sequence[index - 1]);
  }

  return result.reverse().join("");
}

function WeightModal({
  state,
  isOpen,
  onClose,
  onWeightSubmit
}: {
  state: SimulatorState;
  isOpen: boolean;
  onClose: () => void;
  onWeightSubmit: () => void;
}) {
  if (!(state instanceof EditDVRouterState)) {
    return null;
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter Weight</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <NumberInput
            defaultValue={0}
            min={0}
            max={500}
            onChange={(_, val) => {
              state.currentWeight = val;
            }}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Button
            onClick={onWeightSubmit}
          >
            Submit
          </Button>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

const DistanceVectorSimulator = () => {
  const canvasRef = createRef<HTMLCanvasElement>();
  const [nextNum, setNextNum] = useState(1);
  const currentNetwork = useRef<DVNetwork>(new DVNetwork());
  const currentState = useRef<SimulatorState>(
    new DVIdleState(currentNetwork.current)
  );

  const {
    isOpen: isWeightModalOpen,
    onOpen: onWeightModalOpen,
    onClose: onWeightModalClose,
  } = useDisclosure();

  const draw = (ctx: CanvasRenderingContext2D, _: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation='destination-over';
    currentState.current.draw(ctx);
    ctx.fill();
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    canvasRef.current.addEventListener("mousemove", (event) => {
      if (!canvasRef.current) {
        return;
      }

      const canvasPosition = getMousePos(canvasRef.current, [
        event.clientX,
        event.clientY,
      ]);
      currentState.current =
        currentState.current.mouseMoveTransition(canvasPosition);
    });

    canvasRef.current.addEventListener("click", (event) => {
      if (!canvasRef.current) return;
      const canvasPosition = getMousePos(canvasRef.current, [
        event.clientX,
        event.clientY,
      ]);
      currentState.current =
        currentState.current.mouseClickTransition(canvasPosition);
    });
  }, []);

  const onAddRouterClick = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >(
    (_) => {
      currentState.current = new AddDVRouterState(
        currentNetwork.current,
        bijectiveBase26(nextNum)
      );
      setNextNum(nextNum + 1);
    },
    [nextNum]
  );

  const onAddLinkClick = useCallback<
    React.MouseEventHandler<HTMLButtonElement>
  >((_) => {
    currentState.current = new EditDVRouterState(
      currentNetwork.current,
      onWeightModalOpen.bind(this)
    );
  }, []);

  return (
    <>
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem icon={<AddIcon />} onClick={onAddRouterClick}>
            Add New Router
          </MenuItem>
          <MenuItem icon={<AddIcon />} onClick={onAddLinkClick}>
            Add Link
          </MenuItem>
        </MenuList>
      </Menu>
      <Canvas draw={draw} ref={canvasRef} width="1440" height="720"></Canvas>
      <WeightModal
        state={currentState.current}
        isOpen={isWeightModalOpen}
        onClose={onWeightModalClose}
        onWeightSubmit={()=>{
          if (!(currentState.current instanceof EditDVRouterState)) {
            return;
          }
          currentState.current.addLinkToCurrentTopology();
          currentState.current = new DVIdleState(currentNetwork.current);
          onWeightModalClose();
        }}
      />
    </>
  );
};
export default DistanceVectorSimulator;

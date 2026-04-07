import { Modal } from '@mantine/core';

interface WorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ isOpen, onClose }) => {
  return (
    <Modal opened={isOpen} onClose={onClose} fullScreen title="Workflow Builder">
      <h1>Hello</h1>
    </Modal>
  );
};

export default WorkflowBuilder;

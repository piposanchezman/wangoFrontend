import React, { useEffect } from "react";
import { CancelButton } from "../../styles/FormStyles";
import {
  CloseButton,
  BackDrop,
  Container,
  ModalContainer,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "../../styles/components/modals/ModalStyles";

interface ModalProps {
  title: string;
  children?: React.ReactNode;
  closeModal: () => void;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ closeModal, children, title, footer }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  return (
    <Container>
      <BackDrop onClick={closeModal} />
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <h3>{title}</h3>
            <CloseButton onClick={() => closeModal()}>
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 10.586L6.707 5.293 5.293 6.707 10.586 12l-5.293 5.293 1.414 1.414L12 13.414l5.293 5.293 1.414-1.414L13.414 12l5.293-5.293-1.414-1.414L12 10.586z"
                  fill="currentColor"
                ></path>
              </svg>
            </CloseButton>
          </ModalHeader>
          <ModalBody>{children}</ModalBody>
          <ModalFooter>
            {footer && (
              <>
                <CancelButton type="button" onClick={() => closeModal()}>
                  Cancelar
                </CancelButton>
                {footer}
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </ModalContainer>
    </Container>
  );
};

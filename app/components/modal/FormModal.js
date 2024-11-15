'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Flex,
  Textarea,
  Box
} from "@chakra-ui/react";
import { useState, useEffect, forwardRef } from "react";
import Select from 'react-select';

import FileUploadField from "./FileUploadField";
import CameraCapture from "./CameraCapture";


const FormModal = forwardRef(({ formModal, title, fields, setupOptions, hideField, isComment, webcamRef, cameraModal, fileInputRef, useFormHook, isSubmitted, setIsSubmitted, onSubmit }, ref) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useFormHook({ defaultValues: { status: "Pendiente" }});

  const selectedUnidad = watch("unidad_adm");
  const [anexosOptions, setAnexosOptions] = useState([]);
  
  useEffect(() => {
    if (selectedUnidad) {
      const selectedData = setupOptions.find(item => item.unidad === selectedUnidad);
      if (selectedData) {
        setValue("entrante", selectedData.entrante);
        setValue("saliente", selectedData.saliente);
        setValue("responsable", selectedData.responsable);
        setAnexosOptions(selectedData.anexos.map(({ anexo }) => ({ value: anexo, label: anexo })));
      }
    }
  }, [selectedUnidad, setValue, setupOptions]);

  useEffect(() => {
    if (isSubmitted) {
      formModal.onClose();
      reset();
    }
  }, [isSubmitting, reset, formModal.onClose, isSubmitted]);

  return (
    <Modal isOpen={formModal.isOpen} onClose={formModal.onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields?.map(({ field, header, type }) => (
              !hideField?.includes(field) && (
                <FormControl key={field} isInvalid={errors[field]} mb={4}>
                  <FormLabel htmlFor={field}>{header}</FormLabel>
                  {
                    isComment?.includes(field) ? (
                      <Textarea
                        disabled={isSubmitting || isSubmitted}
                        {...register(field)}
                      />
                    ) : field === "unidad_adm" ? (
                      <Select
                        options={setupOptions.map(({ unidad }) => ({ value: unidad, label: unidad }))}
                        isDisabled={isSubmitting || isSubmitted}
                        isClearable={true}
                        placeholder="Selecione una unidad"
                        onChange={(option) => setValue("unidad_adm", option.value)}
                      />
                    ) : field === "anexo" ? (
                      <Select
                        options={anexosOptions}
                        isDisabled={isSubmitting || isSubmitted}
                        isClearable={true}
                        placeholder="Selecione el anexo"
                        onChange={(option) => setValue("anexo", option.value)}
                      />
                    ) : field === "documento" ? (
                      <FileUploadField
                        label="documentos" {...register(field)}
                        ref={fileInputRef}
                        register={register}
                        name={field}
                        isSubmitted={isSubmitted}
                      />
                    ) : field === "foto" ? (
                      <CameraCapture
                        {...register(field)}
                        ref={webcamRef}
                        register={register}
                        name={field}
                        isSubmitted={isSubmitted}
                        cameraModal={cameraModal} 
                      />
                    ) : (
                      <Input
                        disabled={["entrante", "saliente", "responsable"].includes(field) || isSubmitted || isSubmitting}
                        {...register(field)}
                      />
                    )
                  }
                  <FormErrorMessage>{errors[field] && errors[field].message}</FormErrorMessage>
                </FormControl>
              )
            ))}
            <Flex justifyContent="flex-end" mt={4}>
              <Button
                variant="outline"
                onClick={formModal.onClose}
                mr={2}
                isLoading={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
              >
                Submit
              </Button>
            </Flex>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
})

export default FormModal;

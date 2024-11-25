'use client';

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
  Box,
} from '@chakra-ui/react';
import { useState, useEffect, forwardRef } from 'react';
import Select from 'react-select';
import { Controller } from 'react-hook-form';
import FileUploadField from './FileUploadField';
import CameraCapture from './CameraCapture';

const FormModal = forwardRef(
  (
    {
      fields,
      setups,
      anexos,
      formModal,
      title,
      hideField,
      isComment,
      webcamRef,
      cameraModal,
      fileInputRef,
      useFormHook,
      isSubmitted,
      onSubmit,
    },
    ref,
  ) => {
    const {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      control,
      formState: { errors, isSubmitting },
    } = useFormHook({ defaultValues: { status: 'Pendiente' } });

    const selectedUnidad = watch('unidad_adm');
    const [unidadOptions, setUnidadOptions] = useState([]);
    const [anexosOptions, setAnexosOptions] = useState([]);
    useEffect(() => {
      if (anexos && setups) {
        let unidadList = [];
        let anexosList = [];
        setups.map((setup) => {
          unidadList.push(setup.unidad_adm);
        });

        anexos.map((anexo) => {
          anexosList.push(anexo.anexo);
        });

        setUnidadOptions(unidadList);
        setAnexosOptions(anexosList);
      }
    }, [setups, anexos]);

    useEffect(() => {
      if (selectedUnidad) {
        let selectedSetup = setups.find(
          (setup) => setup.unidad_adm === selectedUnidad.value,
        );
        setValue('entrante', selectedSetup.entrante);
        setValue('saliente', selectedSetup.saliente);
        setValue('responsable', selectedSetup.responsable);
      }
    }, [selectedUnidad]);

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
              {fields?.map(
                ({ field, header, type }) =>
                  !hideField?.includes(field) && (
                    <FormControl key={field} isInvalid={errors[field]} mb={4}>
                      <FormLabel htmlFor={field}>{header}</FormLabel>
                      {isComment?.includes(field) ? (
                        <Textarea
                          disabled={isSubmitting || isSubmitted}
                          {...register(field)}
                        />
                      ) : field === 'unidad_adm' ? (
                        <Controller
                          name="unidad_adm"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={unidadOptions.map((unidad) => ({
                                value: unidad,
                                label: unidad,
                              }))}
                              isDisabled={isSubmitting || isSubmitted}
                              isClearable={true}
                              placeholder="Selecione una unidad"
                            />
                          )}
                        />
                      ) : field === 'anexo' ? (
                        <Controller
                          name="anexo"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={anexosOptions.map((anexo) => ({
                                value: anexo,
                                label: anexo,
                              }))}
                              isDisabled={isSubmitting || isSubmitted}
                              isClearable={true}
                              placeholder="Selecione el anexo"
                            />
                          )}
                        />
                      ) : field === 'documento' ? (
                        <FileUploadField
                          label="documentos"
                          {...register(field)}
                          ref={fileInputRef}
                          register={register}
                          name={field}
                          isSubmitted={isSubmitted}
                        />
                      ) : field === 'foto' ? (
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
                          disabled={
                            ['entrante', 'saliente', 'responsable'].includes(
                              field,
                            ) ||
                            isSubmitted ||
                            isSubmitting
                          }
                          {...register(field)}
                        />
                      )}
                      <FormErrorMessage>
                        {errors[field] && errors[field].message}
                      </FormErrorMessage>
                    </FormControl>
                  ),
              )}
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
  },
);

export default FormModal;

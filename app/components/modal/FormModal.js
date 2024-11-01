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
  Select,
  Textarea, 
  Box
} from "@chakra-ui/react";
import { useState, useEffect, forwardRef } from "react";

import FileUploadField from "./FileUploadField";
import CameraCapture from "./CameraCapture";


const FormModal = forwardRef(({ isOpen, onClose, title, fields, setupOptions, hideField, isComment, setIsLoading, storeFiles, createDocument, useFormHook, isSubmitted, setIsSubmitted },webcamRef) => {
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
        setAnexosOptions(selectedData.anexos);
      }
    }
  }, [selectedUnidad, setValue, setupOptions]);

  const onSubmit = async (data) => {
    console.log("sendind files")
    try {
      setIsLoading({fileId:data.id, loading:true})
      const storeNewFiles = await storeFiles(data)
      if (storeNewFiles) {
        const storedFilePaths = storeNewFiles.filePaths
        const newDocument = await createDocument({...data, documento: storedFilePaths.documentoPath, foto: storedFilePaths.fotoPath})
        newDocument && setIsSubmitted(true);
        if (!newDocument) throw new Error("Error creating document. Document creation aborted.")
      } else  {
        console.error("Error storing files. Document creation aborted.")
        setIsLoading({fileId:data.id, loading:false})
        return console.log("Error storing files")
      }
    } catch (error) {
      console.error("Error creating document:", error)
      setIsLoading({fileId:data.id, loading:false})
    } finally {
      setIsLoading({fileId:data.id, loading:false})
      onClose()
      setIsSubmitted(false) && reset()
    }

  };

  
  useEffect(() => {
    if (isSubmitted) {
      reset(); 
    } else if(!isOpen){
        reset();
    }
  }, [isSubmitted, isOpen]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            {
            fields?.map(({field, header, type}) => (
                // Check if the field is in the hideField array
                !hideField?.includes(field) && (
                  <FormControl key={field} isInvalid={errors[field]} mb={4}>
                    <FormLabel htmlFor={field}>{header}</FormLabel>
                    {
                        isComment?.includes(field) ?
                            <Textarea 
                              disabled={isSubmitting || isSubmitted} 
                              {...register(field)} 
                            /> :
                        field === "unidad_adm" ? 
                            <Select 
                              disabled={isSubmitting || isSubmitted} 
                              {...register(field, { required: true } )} 
                              placeholder="Selecione una unidad" 
                            >
                                {
                                  setupOptions?.map(({unidad})=>{
                                    return <option key={unidad} value={unidad}>{unidad}</option>
                                  })
                                }
                            </Select> :
                        field === "anexo" ? 
                            <Select 
                              disabled={isSubmitting || isSubmitted} 
                              {...register(field, { required: true } )} 
                              placeholder="Selecione el anexo" 
                            >
                                {
                                  anexosOptions.map(({ anexo }) => (
                                    <option key={anexo} value={anexo}>{anexo}</option>
                                  ))
                                }
                            </Select> :
                        field === "documento" ?
                            <FileUploadField 
                              label="Capture" {...register(field)} 
                              register={register} 
                              name={field} 
                              isSubmitted={isSubmitted}  
                            /> :
                        field === "foto" ?
                            <CameraCapture 
                              {...register(field)} 
                              ref={webcamRef} 
                              register={register} 
                              name={field} 
                              isSubmitted={isSubmitted}
                              isModal={true} 
                            /> :
                            <Input 
                              disabled={field === "entrante" || field === "saliente" || field === "responsable"} 
                              {...register(field)} 
                            />
                    }
                  </FormControl>
                )
              ))}
            <Flex justifyContent="flex-end" mt={4}>
              <Button
                variant="outline"
                onClick={onClose}
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

export default FormModal

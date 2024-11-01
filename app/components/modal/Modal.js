import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,  FormControl, FormLabel, Input, Button, Select } from '@chakra-ui/react';
import { useState } from 'react';
import moment from 'moment';

const ModalComponent = ({ isOpen, onClose, title, submitFunction, dataStructure, roles, hideFields, users, setUsers }) => {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target;
    name === 'birthdate' ? 
        setFormData({ ...formData, [name]: moment(value, 'MM/DD/YYYY').format('DD-MM-YYYY') }) :
        setFormData({ ...formData, [name]: value });
    console.log('handle change',formData)
  };

  const handleRoleChange = (e) => {
    console.log('target:', e.target.value)

    const selectedRole = roles.find(role => role.role_name === e.target.value);
    setFormData({
        ...formData,
        'role': selectedRole ? selectedRole.id : null,
        'role_name': e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFunction(formData);
    } catch (err) {
      console.log("Error submitting data:", err);
      setError("An error occurred:", error)
      setFormData({})
    } finally{
        setUsers([...users, formData])
        onClose()
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleSubmit}>
              {dataStructure.map(({ field, header, type }) => (
                !hideFields.includes(field) && (
                  <FormControl key={field}>
                    <FormLabel htmlFor={field}>{header}</FormLabel>
                    {field === 'role_name' ? (
                      <Select id={field} name={field} value={formData[field] || ''} onChange={handleRoleChange}>
                        <option value="">Select Role</option>
                        {roles.map(role => (
                          <option key={role.id} value={role.role_name}>{role.role_name}</option>
                        ))}
                      </Select>
                    ) : (
                      <Input
                        id={field}
                        name={field}
                        type={type === 'date' ? 'date' : 'text'}
                        placeholder={type === 'date' ? 'dd/mm/aaaa' : header}
                        value={formData[field] || ''}
                        onChange={handleChange}
                      />
                    )}
                  </FormControl>
                )
              ))}
               {error && <p className='text-red-500'>{error}</p>}
              <Button type="submit" mt={4}>
                Submit
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ModalComponent;
document.addEventListener('DOMContentLoaded', function() {
    // Selección de elementos principales
    const form = document.getElementById('employmentApplication');
    const progressSteps = document.querySelectorAll('.progress-steps li');
    const progressBar = document.querySelector('.progress');
    const sections = document.querySelectorAll('.form-section');
    
    // Sección de experiencia laboral
    const addExperienceBtn = document.getElementById('addExperience');
    const experienceList = document.getElementById('experienceList');
    
    // Sección de habilidades
    const addSkillBtn = document.getElementById('addSkill');
    const skillsList = document.getElementById('skillsList');
    
    // Campos específicos
    const educationLevelSelect = document.getElementById('educationLevel');
    const higherEducationFields = document.getElementById('higherEducationFields');
    const sourceOtherCheckbox = document.getElementById('sourceOther');
    const sourceOtherContainer = document.getElementById('sourceOtherContainer');
    
    // Botones de navegación
    const navButtons = document.querySelectorAll('.btn-next, .btn-prev');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Campos de archivo
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    // Inicialización de contadores
    let experienceCount = 1;
    let skillsCount = 2;
    
    // ========== NAVEGACIÓN ENTRE SECCIONES ==========
    
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentSection = document.querySelector('.form-section.active');
            let nextSection;
            
            if (this.classList.contains('btn-next')) {
                // Validación antes de avanzar
                if (!validateSection(currentSection)) {
                    return false;
                }
                
                const nextId = this.getAttribute('data-next');
                nextSection = document.getElementById(nextId);
                
                // Actualizar barra de progreso
                updateProgress(nextId);
            } else if (this.classList.contains('btn-prev')) {
                const prevId = this.getAttribute('data-prev');
                nextSection = document.getElementById(prevId);
                
                // Actualizar barra de progreso
                updateProgress(prevId);
            }
            
            if (nextSection) {
                currentSection.classList.remove('active');
                nextSection.classList.add('active');
                
                // Hacer scroll al inicio de la sección
                nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Establecer focus al primer campo de la nueva sección
                const firstInput = nextSection.querySelector('input, select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }
        });
    });
    
    // Actualizar barra de progreso
    function updateProgress(sectionId) {
        const stepIndex = Array.from(progressSteps).findIndex(step => step.getAttribute('data-step') === sectionId);
        
        if (stepIndex !== -1) {
            // Actualizar clases en los pasos
            progressSteps.forEach((step, index) => {
                if (index <= stepIndex) {
                    step.classList.add('active');
                } else {
                    step.classList.remove('active');
                }
            });
            
            // Actualizar ancho de la barra de progreso
            const progressPercentage = ((stepIndex + 1) / progressSteps.length) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
    }
    
    // Permitir hacer clic en los pasos de progreso para navegar
    progressSteps.forEach(step => {
        step.addEventListener('click', function() {
            const targetSectionId = this.getAttribute('data-step');
            const currentSection = document.querySelector('.form-section.active');
            const targetSection = document.getElementById(targetSectionId);
            
            // Solo permitir navegar a secciones anteriores o la actual
            const currentIndex = Array.from(sections).indexOf(currentSection);
            const targetIndex = Array.from(sections).indexOf(targetSection);
            
            if (targetIndex <= currentIndex) {
                currentSection.classList.remove('active');
                targetSection.classList.add('active');
                updateProgress(targetSectionId);
                
                // Hacer scroll al inicio de la sección
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // ========== VALIDACIÓN DE FORMULARIO ==========
    
    // Validación de sección completa
    function validateSection(section) {
        const sectionId = section.id;
        let isValid = true;
        
        // Obtener todos los campos requeridos en esta sección
        const requiredFields = section.querySelectorAll('input[required], select[required], textarea[required]');
        
        // Validar cada campo requerido
        requiredFields.forEach(field => {
            // Borrar mensajes de error previos
            clearError(field);
            
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Validaciones específicas para cada sección
        switch (sectionId) {
            case 'personal':
                // Validar email con formato correcto
                const emailField = document.getElementById('email');
                if (emailField.value && !validateEmail(emailField.value)) {
                    showError(emailField, 'Por favor, introduce un correo electrónico válido');
                    isValid = false;
                }
                
                // Validar teléfono con formato correcto
                const phoneField = document.getElementById('phone');
                if (phoneField.value && !validatePhone(phoneField.value)) {
                    showError(phoneField, 'Por favor, introduce un número de teléfono válido');
                    isValid = false;
                }
                
                // Validar código postal con formato correcto
                const zipCodeField = document.getElementById('zipCode');
                if (zipCodeField.value && !validateZipCode(zipCodeField.value)) {
                    showError(zipCodeField, 'Por favor, introduce un código postal válido');
                    isValid = false;
                }
                break;
                
            case 'education':
                // Validar campos de educación superior si aplica
                if (educationLevelSelect.value !== 'highschool' && educationLevelSelect.value !== '') {
                    const institutionField = document.getElementById('institution');
                    const degreeField = document.getElementById('degree');
                    const graduationDateField = document.getElementById('graduationDate');
                    
                    if (!institutionField.value) {
                        showError(institutionField, 'Por favor, introduce el nombre de la institución educativa');
                        isValid = false;
                    }
                    
                    if (!degreeField.value) {
                        showError(degreeField, 'Por favor, introduce el título obtenido');
                        isValid = false;
                    }
                    
                    if (!graduationDateField.value) {
                        showError(graduationDateField, 'Por favor, selecciona la fecha de graduación');
                        isValid = false;
                    } else {
                        // Validar que la fecha no sea futura
                        const today = new Date();
                        const gradDate = new Date(graduationDateField.value);
                        if (gradDate > today) {
                            showError(graduationDateField, 'La fecha de graduación no puede ser futura');
                            isValid = false;
                        }
                    }
                }
                break;
                
            case 'skills':
                // Verificar al menos 2 habilidades completadas
                const skillInputs = section.querySelectorAll('input[id^="skill"]');
                const skillLevels = section.querySelectorAll('select[id^="skillLevel"]');
                let validSkillsCount = 0;
                
                for (let i = 0; i < skillInputs.length; i++) {
                    if (skillInputs[i].value && skillLevels[i].value) {
                        validSkillsCount++;
                    }
                }
                
                if (validSkillsCount < 2) {
                    showError(document.getElementById('skill0'), 'Por favor, añade al menos 2 habilidades');
                    isValid = false;
                }
                break;
                
            case 'documents':
                // Validar el CV (requerido)
                const cvInput = document.getElementById('cv');
                if (cvInput.files.length > 0) {
                    if (!validateFileSize(cvInput, 5 * 1024 * 1024)) { // 5MB max
                        showError(cvInput, 'El archivo no debe superar los 5MB');
                        isValid = false;
                    }
                    
                    if (!validateFileType(cvInput, ['.pdf', '.doc', '.docx'])) {
                        showError(cvInput, 'Formato de archivo no permitido. Use PDF, DOC o DOCX');
                        isValid = false;
                    }
                }
                
                // Validar carta de presentación (opcional)
                const coverLetterInput = document.getElementById('coverLetter');
                if (coverLetterInput.files.length > 0) {
                    if (!validateFileSize(coverLetterInput, 2 * 1024 * 1024)) { // 2MB max
                        showError(coverLetterInput, 'El archivo no debe superar los 2MB');
                        isValid = false;
                    }
                    
                    if (!validateFileType(coverLetterInput, ['.pdf', '.doc', '.docx'])) {
                        showError(coverLetterInput, 'Formato de archivo no permitido. Use PDF, DOC o DOCX');
                        isValid = false;
                    }
                }
                
                // Validar portafolio (opcional)
                const portfolioInput = document.getElementById('portfolio');
                if (portfolioInput.files.length > 0) {
                    if (!validateFileSize(portfolioInput, 10 * 1024 * 1024)) { // 10MB max
                        showError(portfolioInput, 'El archivo no debe superar los 10MB');
                        isValid = false;
                    }
                    
                    if (!validateFileType(portfolioInput, ['.pdf', '.zip'])) {
                        showError(portfolioInput, 'Formato de archivo no permitido. Use PDF o ZIP');
                        isValid = false;
                    }
                }
                break;
                
            case 'additional':
                // Validar al menos una fuente seleccionada
                const sourceCheckboxes = document.querySelectorAll('input[name="source[]"]:checked');
                if (sourceCheckboxes.length === 0) {
                    showError(null, 'Por favor, selecciona al menos una opción', 'sourceError');
                    isValid = false;
                }
                
                // Validar campo "otro" si está seleccionado
                if (sourceOtherCheckbox.checked && !document.getElementById('sourceOtherText').value) {
                    showError(document.getElementById('sourceOtherText'), 'Por favor, especifica cómo nos encontraste');
                    isValid = false;
                }
                
                // Validar disponibilidad
                const availabilityField = document.getElementById('availability');
                if (availabilityField.value) {
                    const today = new Date();
                    const selectedDate = new Date(availabilityField.value);
                    
                    if (selectedDate < today) {
                        showError(availabilityField, 'La fecha y hora debe ser posterior a la actual');
                        isValid = false;
                    }
                }
                
                // Validar que los términos estén aceptados
                const dataVerification = document.getElementById('dataVerification');
                const privacyConsent = document.getElementById('privacyConsent');
                
                if (!dataVerification.checked) {
                    showError(dataVerification, 'Debes confirmar que la información es veraz', 'dataVerificationError');
                    isValid = false;
                }
                
                if (!privacyConsent.checked) {
                    showError(privacyConsent, 'Debes aceptar la política de privacidad', 'privacyConsentError');
                    isValid = false;
                }
                break;
        }
        
        // Si hay errores, hacer scroll al primer error
        if (!isValid) {
            const firstErrorField = section.querySelector('.error-message:not(:empty)');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Enfocar al campo relacionado con el error
                const fieldId = firstErrorField.id.replace('Error', '');
                const field = document.getElementById(fieldId);
                if (field) {
                    field.focus();
                }
            }
        }
        
        return isValid;
    }
    
    // Validación de campo individual
    function validateField(field) {
        if (field.type === 'checkbox') {
            if (field.required && !field.checked) {
                showError(field, 'Este campo es obligatorio', `${field.id}Error`);
                return false;
            }
        } else if (field.type === 'file') {
            if (field.required && field.files.length === 0) {
                showError(field, 'Por favor, selecciona un archivo');
                return false;
            }
        } else if (field.required && !field.value.trim()) {
            showError(field, 'Este campo es obligatorio');
            return false;
        }
        
        return true;
    }
    
    // Mostrar mensaje de error
    function showError(field, message, errorElementId = null) {
        const errorId = errorElementId || (field ? `${field.id}Error` : null);
        if (errorId) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.textContent = message;
                errorElement.setAttribute('role', 'alert');
                
                if (field) {
                    field.setAttribute('aria-invalid', 'true');
                    field.classList.add('invalid');
                }
            }
        }
    }
    
    // Limpiar mensaje de error
    function clearError(field) {
        if (field) {
            const errorId = `${field.id}Error`;
            const errorElement = document.getElementById(errorId);
            
            if (errorElement) {
                errorElement.textContent = '';
                errorElement.removeAttribute('role');
            }
            
            field.removeAttribute('aria-invalid');
            field.classList.remove('invalid');
        }
    }
    
    // Funciones de validación específicas
    function validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    function validatePhone(phone) {
        // Aceptar formato internacional o local, con o sin espacios/guiones
        const phoneRegex = /^(\+?[0-9]{1,3}[-\s]?)?([0-9]{3,4}[-\s]?[0-9]{3,4}[-\s]?[0-9]{0,4})$/;
        return phoneRegex.test(phone);
    }
    
    function validateZipCode(zipCode) {
        // Formato genérico para código postal (números y letras, entre 3-10 caracteres)
        const zipCodeRegex = /^[a-zA-Z0-9]{3,10}$/;
        return zipCodeRegex.test(zipCode);
    }
    
    function validateFileSize(fileInput, maxSize) {
        if (fileInput.files.length > 0) {
            const fileSize = fileInput.files[0].size;
            return fileSize <= maxSize;
        }
        return true;
    }
    
    function validateFileType(fileInput, allowedExtensions) {
        if (fileInput.files.length > 0) {
            const fileName = fileInput.files[0].name;
            const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            return allowedExtensions.includes(fileExtension);
        }
        return true;
    }
    
    // Validación en tiempo real para campos importantes
    const realTimeValidationFields = [
        { id: 'email', validator: validateEmail, message: 'Por favor, introduce un correo electrónico válido' },
        { id: 'phone', validator: validatePhone, message: 'Por favor, introduce un número de teléfono válido' },
        { id: 'zipCode', validator: validateZipCode, message: 'Por favor, introduce un código postal válido' }
    ];
    
    realTimeValidationFields.forEach(fieldInfo => {
        const field = document.getElementById(fieldInfo.id);
        if (field) {
            field.addEventListener('blur', function() {
                clearError(this);
                
                if (this.value) {
                    if (!fieldInfo.validator(this.value)) {
                        showError(this, fieldInfo.message);
                    }
                } else if (this.required) {
                    showError(this, 'Este campo es obligatorio');
                }
            });
        }
    });
    
    // ========== GESTIÓN DE EXPERIENCIA LABORAL ==========
    
    addExperienceBtn.addEventListener('click', function() {
        if (experienceCount < 3) {
            // Clonar la primera experiencia como plantilla
            const experienceTemplate = experienceList.querySelector('.experience-item').cloneNode(true);
            const newIndex = experienceCount;
            
            // Actualizar índices en IDs y names
            experienceTemplate.setAttribute('data-index', newIndex);
            experienceTemplate.querySelector('h3').textContent = `Experiencia ${newIndex + 1}`;
            
            const fields = experienceTemplate.querySelectorAll('input, textarea');
            fields.forEach(field => {
                const oldId = field.id;
                const newId = oldId.replace(/\d+/, newIndex);
                
                field.id = newId;
                field.name = field.name.replace(/\[\d+\]/, `[${newIndex}]`);
                
                // Limpiar valores
                field.value = '';
                if (field.type === 'checkbox') {
                    field.checked = false;
                }
                
                // Actualizar labels y aria-describedby
                const label = experienceTemplate.querySelector(`label[for="${oldId}"]`);
                if (label) {
                    label.setAttribute('for', newId);
                }
                
                if (field.getAttribute('aria-describedby')) {
                    const newDescribedBy = field.getAttribute('aria-describedby').replace(/\d+/, newIndex);
                    field.setAttribute('aria-describedby', newDescribedBy);
                }
                
                // Actualizar ID del mensaje de error
                const errorDiv = experienceTemplate.querySelector(`#${oldId}Error`);
                if (errorDiv) {
                    errorDiv.id = `${newId}Error`;
                }
            });
            
            // Añadir event listener para "trabajo actual"
            const currentJobCheckbox = experienceTemplate.querySelector(`#currentJob${newIndex}`);
            const endDateField = experienceTemplate.querySelector(`#endDate${newIndex}`);
            
            currentJobCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    endDateField.value = '';
                    endDateField.disabled = true;
                } else {
                    endDateField.disabled = false;
                }
            });
            
            // Añadir la nueva experiencia al DOM
            experienceList.appendChild(experienceTemplate);
            experienceCount++;
            
            // Desactivar botón si se alcanzó el límite
            if (experienceCount >= 3) {
                addExperienceBtn.disabled = true;
            }
        }
    });
    
    // Inicializar listener para "trabajo actual" en la primera experiencia
    document.getElementById('currentJob0').addEventListener('change', function() {
        const endDateField = document.getElementById('endDate0');
        if (this.checked) {
            endDateField.value = '';
            endDateField.disabled = true;
        } else {
            endDateField.disabled = false;
        }
    });
    
    // ========== GESTIÓN DE HABILIDADES ==========
    
    addSkillBtn.addEventListener('click', function() {
        // Clonar la primera habilidad como plantilla
        const skillTemplate = skillsList.querySelector('.skill-item').cloneNode(true);
        const newIndex = skillsCount;
        
        // Actualizar índices en IDs y names
        skillTemplate.setAttribute('data-index', newIndex);
        
        const inputField = skillTemplate.querySelector('input');
        const selectField = skillTemplate.querySelector('select');
        const removeBtn = skillTemplate.querySelector('.remove-skill');
        
        // Actualizar input
        const oldInputId = inputField.id;
        const newInputId = `skill${newIndex}`;
        inputField.id = newInputId;
        inputField.name = inputField.name.replace(/\[\d+\]/, `[${newIndex}]`);
        inputField.value = '';
        
        // Actualizar label para input
        const inputLabel = skillTemplate.querySelector(`label[for="${oldInputId}"]`);
        if (inputLabel) {
            inputLabel.setAttribute('for', newInputId);
        }
        
        // Actualizar aria-describedby
        if (inputField.getAttribute('aria-describedby')) {
            const newDescribedBy = `skill${newIndex}Error`;
            inputField.setAttribute('aria-describedby', newDescribedBy);
        }
        
        // Actualizar ID del mensaje de error para input
        const inputErrorDiv = skillTemplate.querySelector(`#${oldInputId}Error`);
        if (inputErrorDiv) {
            inputErrorDiv.id = `skill${newIndex}Error`;
        }
        
        // Actualizar select
        const oldSelectId = selectField.id;
        const newSelectId = `skillLevel${newIndex}`;
        selectField.id = newSelectId;
        selectField.name = selectField.name.replace(/\[\d+\]/, `[${newIndex}]`);
        selectField.selectedIndex = 0;
        
        // Actualizar label para select
        const selectLabel = skillTemplate.querySelector(`label[for="${oldSelectId}"]`);
        if (selectLabel) {
            selectLabel.setAttribute('for', newSelectId);
        }
        
        // Actualizar aria-describedby para select
        if (selectField.getAttribute('aria-describedby')) {
            const newDescribedBy = `skillLevel${newIndex}Error`;
            selectField.setAttribute('aria-describedby', newDescribedBy);
        }
        
        // Actualizar ID del mensaje de error para select
        const selectErrorDiv = skillTemplate.querySelector(`#${oldSelectId}Error`);
        if (selectErrorDiv) {
            selectErrorDiv.id = `skillLevel${newIndex}Error`;
        }
        
        // Activar botón de eliminar
        removeBtn.disabled = false;
        
        // Añadir event listener al botón de eliminar
        removeBtn.addEventListener('click', function() {
            const skillItem = this.closest('.skill-item');
            skillsList.removeChild(skillItem);
            skillsCount--;
            
            // Reactivar botón de añadir si hace falta
            if (skillsCount < 10) {
                addSkillBtn.disabled = false;
            }
        });
        
        // Añadir la nueva habilidad al DOM
        skillsList.appendChild(skillTemplate);
        skillsCount++;
        
        // Desactivar botón si se alcanzó el límite
        if (skillsCount >= 10) {
            addSkillBtn.disabled = true;
        }
    });
    
    // Añadir event listeners a los botones de eliminar existentes
    const initialRemoveButtons = document.querySelectorAll('.remove-skill');
    initialRemoveButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                const skillItem = this.closest('.skill-item');
                skillsList.removeChild(skillItem);
                skillsCount--;
                
                // Reactivar botón de añadir
                if (skillsCount < 10) {
                    addSkillBtn.disabled = false;
                }
            }
        });
    });
    
    // ========== CAMPOS CONDICIONALES ==========
    
    // Mostrar/ocultar campos de educación superior
    educationLevelSelect.addEventListener('change', function() {
        if (this.value === 'highschool' || this.value === '') {
            higherEducationFields.style.display = 'none';
            
            // Borrar valores y quitar required
            const fields = higherEducationFields.querySelectorAll('input');
            fields.forEach(field => {
                field.value = '';
                field.required = false;
            });
        } else {
            higherEducationFields.style.display = 'block';
            
            // Hacer campos obligatorios
            document.getElementById('institution').required = true;
            document.getElementById('degree').required = true;
            document.getElementById('graduationDate').required = true;
        }
    });
    
    // Mostrar/ocultar campo "otro" en fuentes
    sourceOtherCheckbox.addEventListener('change', function() {
        if (this.checked) {
            sourceOtherContainer.style.display = 'block';
            document.getElementById('sourceOtherText').required = true;
        } else {
            sourceOtherContainer.style.display = 'none';
            document.getElementById('sourceOtherText').required = false;
            document.getElementById('sourceOtherText').value = '';
        }
    });
    
    // ========== MANIPULACIÓN DE ARCHIVOS ==========
    
    // Mostrar nombre del archivo seleccionado
    fileInputs.forEach(input => {
        const fileNameSpan = document.getElementById(`${input.id}FileName`);
        
        input.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
                
                // Validar tipo y tamaño del archivo
                let maxSize;
                let allowedExtensions;
                
                if (this.id === 'cv') {
                    maxSize = 5 * 1024 * 1024; // 5MB
                    allowedExtensions = ['.pdf', '.doc', '.docx'];
                } else if (this.id === 'coverLetter') {
                    maxSize = 2 * 1024 * 1024; // 2MB
                    allowedExtensions = ['.pdf', '.doc', '.docx'];
                } else if (this.id === 'portfolio') {
                    maxSize = 10 * 1024 * 1024; // 10MB
                    allowedExtensions = ['.pdf', '.zip'];
                }
                
                clearError(this);
                
                if (!validateFileSize(this, maxSize)) {
                    const sizeInMB = maxSize / (1024 * 1024);
                    showError(this, `El archivo no debe superar los ${sizeInMB}MB`);
                }
                
                if (!validateFileType(this, allowedExtensions)) {
                    showError(this, `Formato de archivo no permitido. Use ${allowedExtensions.join(', ')}`);
                }
            } else {
                fileNameSpan.textContent = 'Ningún archivo seleccionado';
            }
        });
    });
    
    // ========== ENVÍO DEL FORMULARIO ==========
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar todos los campos
        let formIsValid = true;
        sections.forEach(section => {
            // No validamos la sección de confirmación
            if (section.id !== 'confirmation' && !validateSection(section)) {
                formIsValid = false;
            }
        });
        
        if (formIsValid) {
            // Simular envío exitoso (aquí se haría el envío real al servidor)
            const currentSection = document.querySelector('.form-section.active');
            const confirmationSection = document.getElementById('confirmation');
            
            // Generar número de referencia aleatorio
            const referenceNumber = 'REF' + Math.floor(Math.random() * 900000 + 100000);
            document.getElementById('referenceNumber').textContent = referenceNumber;
            
            // Mostrar sección de confirmación
            currentSection.classList.remove('active');
            confirmationSection.classList.add('active');
            
            // Resetear barra de progreso
            progressBar.style.width = '100%';
            progressSteps.forEach(step => step.classList.add('active'));
            
            // Hacer scroll al inicio de la confirmación
            confirmationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
    
    // ========== MEJORAS DE ACCESIBILIDAD ==========
    
    // Funcionalidad de impresión para la solicitud
    document.getElementById('printApplication').addEventListener('click', function() {
        window.print();
    });
    
    // Navegación por teclado
    document.addEventListener('keydown', function(e) {
        // Enter en los pasos del progreso para navegar
        if (e.key === 'Enter' && e.target.closest('.progress-steps li')) {
            e.target.click();
        }
    });
});
export function validatePersonalTab(data) {
  const errors = {};

  if (!data.photoUri) {
    errors.photoUri = 'La foto de perfil es obligatoria';
  }

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'El nombre completo es obligatorio';
  } else if (data.fullName.trim().length > 50) {
    errors.fullName = 'Máximo 50 caracteres';
  } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.fullName.trim())) {
    errors.fullName = 'Solo se permiten letras y espacios';
  }

  if (!data.documentId || !data.documentId.trim()) {
    errors.documentId = 'El documento de identidad es obligatorio';
  } else if (!/^\d{6,10}$/.test(data.documentId.trim())) {
    errors.documentId = 'Debe ser numérico de 6 a 10 dígitos';
  }

  if (!data.phone || !data.phone.trim()) {
    errors.phone = 'El número de celular es obligatorio';
  } else if (!/^\d{10}$/.test(data.phone.trim())) {
    errors.phone = 'Debe contener exactamente 10 dígitos';
  }

  if (!data.birthDate || !data.birthDate.trim()) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria (AAAA-MM-DD)';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.birthDate.trim())) {
    errors.birthDate = 'Formato inválido. Use AAAA-MM-DD';
  } else {
    const birth = new Date(data.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    if (isNaN(age) || age < 18) {
      errors.birthDate = 'El conductor debe ser mayor de 18 años';
    }
  }

  if (!data.gender) {
    errors.gender = 'Selecciona un género';
  }

  if (!data.email || !data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Ingrese un correo electrónico válido con dominio';
  }

  if (!data.language) {
    errors.language = 'Selecciona el idioma';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function validateVehicleTab(data) {
  const errors = {};
  const currentYear = new Date().getFullYear();

  if (!data.category) {
    errors.category = 'Selecciona la categoría del vehículo';
  }

  const plateClean = (data.plate || '').toUpperCase().trim();
  if (!plateClean) {
    errors.plate = 'La placa es obligatoria';
  } else if (!/^[A-Z]{3}\d{3}$/.test(plateClean)) {
    errors.plate = 'Formato colombiano inválido (ej. ABC123)';
  }

  if (!data.brandModel || !data.brandModel.trim()) {
    errors.brandModel = 'La marca y modelo son obligatorios';
  } else if (data.brandModel.trim().length > 30) {
    errors.brandModel = 'Máximo 30 caracteres';
  }

  const yearNum = parseInt(data.year, 10);
  if (!data.year || !data.year.toString().trim()) {
    errors.year = 'El año es obligatorio';
  } else if (!/^\d{4}$/.test(data.year.toString().trim()) || isNaN(yearNum)) {
    errors.year = 'Debe ser un año de 4 dígitos';
  } else if (yearNum > currentYear) {
    errors.year = `El año no puede ser mayor a ${currentYear}`;
  }

  if (!data.color) {
    errors.color = 'Selecciona el color del vehículo';
  }

  const capacityNum = parseInt(data.capacity, 10);
  if (!data.capacity || isNaN(capacityNum) || capacityNum <= 0) {
    errors.capacity = 'Ingresa la capacidad de pasajeros';
  } else if (data.category === 'xl' && capacityNum < 6) {
    errors.capacity = 'La categoría XL exige mínimo 6 pasajeros';
  }

  if (!data.vehiclePhotoUri) {
    errors.vehiclePhotoUri = 'La foto del vehículo con placa visible es obligatoria';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

export function validateDocumentsTab(data, vehicleYear) {
  const errors = {};
  const todayStr = new Date().toISOString().split('T')[0];

  if (!data.licenseNumber || !data.licenseNumber.trim()) {
    errors.licenseNumber = 'Número de licencia obligatorio';
  } else if (!/^\d{1,10}$/.test(data.licenseNumber.trim())) {
    errors.licenseNumber = 'Debe ser numérico y de máximo 10 dígitos';
  }
  if (!data.licensePhotoUri) {
    errors.licensePhotoUri = 'Foto de la licencia obligatoria';
  }
  if (!data.licenseExpiry || data.licenseExpiry <= todayStr) {
    errors.licenseExpiry = 'La licencia debe tener fecha de vencimiento futura';
  }

  if (!data.soatPhotoUri) {
    errors.soatPhotoUri = 'Foto del SOAT obligatoria';
  }
  if (!data.soatExpiry || data.soatExpiry <= todayStr) {
    errors.soatExpiry = 'El SOAT debe estar vigente (fecha futura)';
  }

  const vYear = parseInt(vehicleYear, 10);
  const currentYear = new Date().getFullYear();
  const requiresTecno = !isNaN(vYear) && (currentYear - vYear >= 5);

  if (requiresTecno) {
    if (!data.tecnoPhotoUri) {
      errors.tecnoPhotoUri = 'Foto de la revisión técnico-mecánica obligatoria (vehículo >= 5 años)';
    }
    if (!data.tecnoExpiry || data.tecnoExpiry <= todayStr) {
      errors.tecnoExpiry = 'La revisión técnico-mecánica debe tener fecha futura';
    }
  }

  if (!data.mercadoPagoEmail || !data.mercadoPagoEmail.trim()) {
    errors.mercadoPagoEmail = 'El correo de Mercado Pago es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.mercadoPagoEmail.trim())) {
    errors.mercadoPagoEmail = 'Formato de correo no válido';
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = 'Debes aceptar los términos y la comisión del 20%';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

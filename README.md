# Documentación del endpoint `/api/usuarios`

El endpoint `api/usuarios` es una API endpoint para la creación de nuevos usuarios en el sistema. Esta función se encarga de recibir los datos del usuario a través de una solicitud POST, realizar las validaciones y sanitización necesarias, y finalmente crear el usuario en la base de datos. En caso de errores, la función maneja las excepciones y responde con el mensaje de error adecuado.

## Métodos HTTP

## Registrar Usuario

```http
POST /api/usuarios
```

#### Parámetros de la Solicitud

La solicitud debe ser de tipo JSON y debe incluir los siguientes campos en el body:

- `rol` (string): El rol del usuario (debe ser 'admin' o 'normal').
- `email` (string): El email del usuario.
- `password` (string): La contraseña del usuario.
- `confirmPassword` (string): Confirmación de la contraseña (debe coincidir con `password`).
- `empleadoId` (integer): ID del empleado asociado al usuario.

#### Headers de la Solicitud

No se deberan incluir Headers.

#### Ejemplo de Solicitud

```json
{
  "rol": "admin",
  "email": "usuario@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "empleadoId": 1
}
```

### Respuestas

### Éxito

- **Código:** 201 Created
- **Contenido:**
  ```json
  {
    "id": 1,
    "email": "usuario@example.com",
    "empleadoId": 1,
    "rol": "admin",
    "activo": true
  }
  ```

### Errores

#### Error 400 - Bad Request

- **Causa:** Algún campo obligatorio falta o es inválido.
  - **Contenido:**
    ```json
    { "error": "Todos los campos son obligatorios" }
    ```
- **Causa:** El email no es válido.
  - **Contenido:**
    ```json
    { "error": "Email inválido" }
    ```
- **Causa:** Las contraseñas no coinciden.
  - **Contenido:**
    ```json
    { "error": "Las contraseñas no coinciden" }
    ```
- **Causa:** El rol no es válido.
  - **Contenido:**
    ```json
    { "error": "Rol inválido" }
    ```
- **Causa:** El empleado no existe.
  - **Contenido:**
    ```json
    { "error": "Empleado no existe" }
    ```

#### Error 500 - Internal Server Error

- **Causa:** Error del servidor o errores específicos de Sequelize.
  - **Contenido:**
    ```json
    {
      "error": "Error al crear usuario",
      "detalle": ["Detalle del error de Sequelize"]
    }
    ```
- **Causa:** Error general del servidor.
  - **Contenido:**
    ```json
    {
      "error": "Error al crear usuario",
      "detalle": "Mensaje de error"
    }
    ```

## Login Usuario

```http
POST /api/usuarios/login
```

#### Parámetros de la Solicitud

La solicitud debe ser de tipo JSON y debe incluir los siguientes campos en el body:

- `email` (string): El email del usuario.
- `password` (string): La contraseña del usuario.

#### Headers de la Solicitud

No se deberan incluir Headers.

#### Ejemplo de Solicitud

```json
{
  "email": "usuario@example.com",
  "password": "password123"
}
```

### Respuestas

### Éxito

- **Código:** 200 OK
- **Contenido:**
  ```json
  {
    "token": "jwt_token"
  }
  ```

### Errores

#### Error 400 - Bad Request

- **Causa:** Falta el email o la contraseña.
  - **Contenido:**
    ```json
    { "error": "Email y contraseña son obligatorios" }
    ```

#### Error 401 - Unauthorized

- **Causa:** Credenciales inválidas.
  - **Contenido:**
    ```json
    { "error": "Credenciales inválidas" }
    ```
- **Causa:** Usuario no activado.
  - **Contenido:**
    ```json
    { "error": "Usuario no activado" }
    ```

#### Error 500 - Internal Server Error

- **Causa:** Error del servidor o errores específicos de Sequelize.
  - **Contenido:**
    ```json
    {
      "error": "Error al crear usuario",
      "detalle": ["Detalle del error de Sequelize"]
    }
    ```
- **Causa:** Error general del servidor.
  - **Contenido:**
    ```json
    {
      "error": "Error al iniciar sesion",
      "detalle": "Mensaje de error"
    }
    ```

## Obtener Usuarios

```http
GET /api/usuarios
```

#### Parámetros de la Solicitud

Sin Parámetros.

#### Headers de la Solicitud

Se debera incluir Authorization header con jwt creado con el usuario en el metodo `POST /usuarios/login`

### Respuestas

### Éxito

- **Código:** 200 OK
- **Contenido:**
  ```json
  [
    {
      "id": 1,
      "rol": "admin",
      "email": "usuario@example.com",
      "empleadoId": 1,
      "activo": true
    },
    {...}
  ]
  ```

### Errores

#### Error 401 - Unauthorized

- **Causa:** Token de autorización no proporcionado.
  - **Contenido:**
    ```json
    { "error": "Token de autorización no proporcionado" }
    ```
- **Causa:** Token de autorización invalido o vencido.
  - **Contenido:**
    ```json
    { "error": "Debe iniciar Sesion - TOKEN INVALIDO" }
    ```

#### Error 500 - Internal Server Error

- **Causa:** Error general del servidor.
  - **Contenido:**
    ```json
    {
      "error": "Error al obtener los usuario",
      "detalle": "Mensaje de error"
    }
    ```

# Documentación del endpoint `/api/usuarios`

## Descripción

El endpoint `api/usuarios` es una API endpoint para la creación de nuevos usuarios en el sistema. Esta función se encarga de recibir los datos del usuario a través de una solicitud POST, realizar las validaciones y sanitización necesarias, y finalmente crear el usuario en la base de datos. En caso de errores, la función maneja las excepciones y responde con el mensaje de error adecuado.

# Métodos HTTP

## Confirmar Usuario

```http
POST /api/usuarios/confirmar
```

#### Parámetros de la Solicitud

La solicitud debe ser de tipo JSON y debe incluir los siguientes campos en el body:

- `email` (string): El email del usuario.

#### Headers de la Solicitud

Se debera incluir Authorization header con jwt creado con un usuario de tipo **Admin** en el metodo `POST /usuarios/login`

#### Ejemplo de Solicitud

```json
{
  "email": "usuario@example.com"
}
```

### Respuestas

### Éxito

- **Código:** 202 Accepted
- **Contenido:**
  ```json
  "Usuario con mail: usuario@example.com activado exitosamente"
  ```

### Errores

#### Error 400 - Bad Request

- **Causa:** Falta el email.
  - **Contenido:**
    ```json
    { "error": "Email es obligatorio" }
    ```
- **Causa:** Usuario ya activado.

  - **Contenido:**
    ```json
    { "error": "Usuario ya esta activado" }
    ```

- **Causa:** Usuario con ese email no existe.
  - **Contenido:**
    ```json
    { "error": "Usuario con ese mail no existe" }
    ```

#### Error 401 - Unauthorized

- **Causa:** Token de autorización no proporcionado.
  - **Contenido:**
    ```json
    { "error": "Token de autorización no proporcionado" }
    ```
- **Causa:** Token de autorización invalido o vencido.
  - **Contenido:**
    ```json
    { "error": "Debe iniciar Sesion - TOKEN INVALIDO" }
    ```
- **Causa:** Usuario en el Token de autorización no es de tipo Admin.
  - **Contenido:**
    ```json
    { "error": "Debe iniciar sesion como administrador para ver este segmento" }
    ```

#### Error 500 - Internal Server Error

- **Causa:** Error general del servidor.
  - **Contenido:**
    ```json
    {
      "error": "Error al activar usuario",
      "detalle": "Mensaje de error"
    }
    ```

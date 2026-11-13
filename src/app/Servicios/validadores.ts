// Mismo patrón que SOLO_LETRAS en el back (RegisterRequestDTO / ActualizarUsuarioDTO).
// Letras (con tildes y ñ), separadas por un espacio, ' o -. Ej: "María José", "O'Connor", "Pérez-Gómez".
// Bloquea números, símbolos, emojis, caracteres invisibles y saltos de línea.
export const SOLO_LETRAS = /^ *[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)* *$/u;

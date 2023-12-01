CREATE TABLE categorias(
    id BIGINT UNSIGNED not null PRIMARY key AUTO_INCREMENT,
    nombre varchar(255) not null
);



CREATE TABLE usuarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_empresa varchar(150),
    id_rol BIGINT UNSIGNED not null,
    ruc varchar(50),
    password varchar(200),
    foreign key (id_rol) references categorias(id) on delete cascade on update cascade
);


CREATE TABLE carpeta_nombre (
    id BIGINT UNSIGNED not null PRIMARY key AUTO_INCREMENT,
    id_usuario BIGINT UNSIGNED not null,
    nombre varchar(100),
    foreign key (id_usuario) references usuarios(id) on delete cascade on update cascade

);

CREATE TABLE carpetas (
    id BIGINT UNSIGNED not null PRIMARY key AUTO_INCREMENT,
    id_carpeta_nombre BIGINT UNSIGNED not null,
    fecha date not null,
    foreign key (id_carpeta_nombre) references carpeta_nombre(id) on delete cascade on update cascade

);


CREATE TABLE reportes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_carpeta_nombre BIGINT UNSIGNED not null,
    nombre varchar(500),
    id_carpeta BIGINT UNSIGNED not null,
    ruta varchar(500),
    id_drive varchar(200),
    foreign key (id_carpeta_nombre) references carpeta_nombre(id) on delete cascade on update cascade,
    foreign key (id_carpeta) references carpetas(id) on delete cascade on update cascade
);



CREATE TABLE comentarios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT UNSIGNED NOT NULL,
    comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foreign key (id_usuario) references usuarios(id) on delete cascade on update cascade
   
);




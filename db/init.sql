--
-- PostgreSQL database dump
--

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: MetodoPago; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MetodoPago" AS ENUM (
    'EFECTIVO',
    'YAPE_PLIN',
    'TARJETA'
);


--
-- Name: Rol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Rol" AS ENUM (
    'ADMIN',
    'CAJERO',
    'ALMACEN'
);


--
-- Name: TipoMovimiento; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TipoMovimiento" AS ENUM (
    'ENTRADA',
    'SALIDA',
    'AJUSTE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Categoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Categoria" (
    id integer NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: Categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Categoria_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Categoria_id_seq" OWNED BY public."Categoria".id;


--
-- Name: Cliente; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cliente" (
    id integer NOT NULL,
    dni text NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    telefono text,
    direccion text,
    distrito text DEFAULT 'Lima Cercado'::text,
    password text NOT NULL,
    "fichaMedica" jsonb DEFAULT '{}'::jsonb,
    botiquin jsonb DEFAULT '[]'::jsonb,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Cliente_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Cliente_id_seq" OWNED BY public."Cliente".id;


--
-- Name: DetalleVenta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DetalleVenta" (
    id integer NOT NULL,
    cantidad integer NOT NULL,
    "precioUnitario" numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    "ventaId" integer NOT NULL,
    "productoId" integer NOT NULL
);


--
-- Name: DetalleVenta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."DetalleVenta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: DetalleVenta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."DetalleVenta_id_seq" OWNED BY public."DetalleVenta".id;


--
-- Name: MovimientoInventario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MovimientoInventario" (
    id integer NOT NULL,
    tipo public."TipoMovimiento" NOT NULL,
    cantidad integer NOT NULL,
    motivo text NOT NULL,
    "stockAnterior" integer NOT NULL,
    "stockNuevo" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "productoId" integer NOT NULL,
    "usuarioId" integer NOT NULL
);


--
-- Name: MovimientoInventario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."MovimientoInventario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MovimientoInventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."MovimientoInventario_id_seq" OWNED BY public."MovimientoInventario".id;


--
-- Name: Producto; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Producto" (
    id integer NOT NULL,
    "codigoBarras" text,
    nombre text NOT NULL,
    "principioActivo" text,
    presentacion text NOT NULL,
    laboratorio text,
    costo numeric(10,2) NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    "stockMinimo" integer DEFAULT 5 NOT NULL,
    lote text,
    "fechaVencimiento" timestamp(3) without time zone,
    imagen text,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categoriaId" integer NOT NULL,
    "proveedorId" integer
);


--
-- Name: Producto_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Producto_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Producto_id_seq" OWNED BY public."Producto".id;


--
-- Name: Proveedor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Proveedor" (
    id integer NOT NULL,
    ruc text NOT NULL,
    "razonSocial" text NOT NULL,
    telefono text,
    contacto text,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: Proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Proveedor_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Proveedor_id_seq" OWNED BY public."Proveedor".id;


--
-- Name: Usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Usuario" (
    id integer NOT NULL,
    nombre text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    rol public."Rol" DEFAULT 'CAJERO'::public."Rol" NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    avatar text,
    telefono text
);


--
-- Name: Usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Usuario_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Usuario_id_seq" OWNED BY public."Usuario".id;


--
-- Name: Venta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Venta" (
    id integer NOT NULL,
    total numeric(10,2) NOT NULL,
    "metodoPago" public."MetodoPago" DEFAULT 'EFECTIVO'::public."MetodoPago" NOT NULL,
    "clienteDoc" text,
    "clienteNom" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "usuarioId" integer NOT NULL
);


--
-- Name: Venta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Venta_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Venta_id_seq" OWNED BY public."Venta".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: Categoria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categoria" ALTER COLUMN id SET DEFAULT nextval('public."Categoria_id_seq"'::regclass);


--
-- Name: Cliente id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cliente" ALTER COLUMN id SET DEFAULT nextval('public."Cliente_id_seq"'::regclass);


--
-- Name: DetalleVenta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DetalleVenta" ALTER COLUMN id SET DEFAULT nextval('public."DetalleVenta_id_seq"'::regclass);


--
-- Name: MovimientoInventario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovimientoInventario" ALTER COLUMN id SET DEFAULT nextval('public."MovimientoInventario_id_seq"'::regclass);


--
-- Name: Producto id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Producto" ALTER COLUMN id SET DEFAULT nextval('public."Producto_id_seq"'::regclass);


--
-- Name: Proveedor id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Proveedor" ALTER COLUMN id SET DEFAULT nextval('public."Proveedor_id_seq"'::regclass);


--
-- Name: Usuario id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Usuario" ALTER COLUMN id SET DEFAULT nextval('public."Usuario_id_seq"'::regclass);


--
-- Name: Venta id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Venta" ALTER COLUMN id SET DEFAULT nextval('public."Venta_id_seq"'::regclass);


--
-- Data for Name: Categoria; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Categoria" (id, nombre, descripcion, activo) FROM stdin;
1	Analgésicos y Antiinflamatorios	Alivio del dolor y fiebre	t
2	Antibióticos	Tratamiento de infecciones bacterianas	t
3	Salud Digestiva & Gastroenterología	Antiácidos, protectores gástricos, antiespasmódicos y salud intestinal	t
4	Respiratorio, Alergias & Farmacia Ética	Antigripales, antihistamínicos, corticoides y formulaciones éticas DIGEMID	t
10	Medicamentos & Farmacia Ética	Analgésicos, antibióticos, antigripales y fármacos éticos con certificación DIGEMID	t
5	Salud Cardiovascular & Crónicos	Antihipertensivos, antidiabéticos y control integral para pacientes crónicos	t
6	Bienestar, Vitaminas & Suplementos	Multivitamínicos, minerales, colágeno y nutrientes de alta biodisponibilidad	t
7	Dermocosmética & Cuidado Personal	Tratamientos dermatológicos de alta eficacia para la salud y protección de tu piel	t
8	Cuidado Pediátrico & Infantil	Nutrición infantil, cremas protectoras y cuidados delicados para el bebé y la madre	t
9	Botiquín & Primeros Auxilios	Materiales de curación, apósitos, gasas estériles y kits esenciales para emergencias	t
\.


--
-- Data for Name: Cliente; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cliente" (id, dni, nombre, email, telefono, direccion, distrito, password, "fichaMedica", botiquin, activo, "createdAt", "updatedAt") FROM stdin;
2	72345678	María Elena Quispe	maria.quispe@gmail.com	955545561	Av. Arequipa 1840, Dpto 502	Lince	$2b$10$tzgD5DHnyoDIqPepTuWeU..2cy2FExKYAA6wGkruwLer1/don5yq2	{"alergias": [], "condiciones": [], "grupoSanguineo": "O+"}	[]	t	2026-11-08 01:53:16.095	2026-11-08 01:53:16.111
1	76880921	Kleverd Apaza Quispe	kleverd@gmail.com		Jr. Mariano Núñez 405	Juliaca Cercado	$2b$10$ckjDLxkcsPziYNoq4PwsJuFa4A71J.LjUi9siSlyq/WkuQJBOyvqO	{"avatar": null, "pedidos": [{"id": "NS-2026-0024", "date": "7/11/2026", "status": "EN_CAMINO", "serieNumero": "B001-00000001"}], "alergias": ["Penicilina", "Sulfas"], "condiciones": ["Hipertensión arterial"], "grupoSanguineo": "O+"}	[{"id": "1", "name": "Paracetamol 500mg", "price": 1.5, "category": "ANALGESICOS", "presentation": "Caja x 20 tabletas"}, {"id": "5", "name": "Amoxicilina 500mg", "price": 4, "category": "ANTIBIOTICOS", "presentation": "Caja x 30 cápsulas"}]	t	2026-11-08 00:09:30.664	2026-11-08 04:57:43.879
\.


--
-- Data for Name: DetalleVenta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DetalleVenta" (id, cantidad, "precioUnitario", subtotal, "ventaId", "productoId") FROM stdin;
14	1	84.90	84.90	13	51
15	2	4.80	9.60	14	35
16	1	14.60	14.60	15	101
17	3	2.50	7.50	16	112
18	2	17.50	35.00	17	98
19	2	14.60	29.20	18	101
20	1	94.90	94.90	19	68
21	1	1.30	1.30	20	19
22	1	2.40	2.40	21	12
23	3	2.40	7.20	22	12
24	1	4.50	4.50	22	32
25	2	129.90	259.80	23	50
26	1	84.90	84.90	24	77
\.


--
-- Data for Name: MovimientoInventario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MovimientoInventario" (id, tipo, cantidad, motivo, "stockAnterior", "stockNuevo", "createdAt", "productoId", "usuarioId") FROM stdin;
19	ENTRADA	20	Inventario inicial integrado con catálogo oficial web	0	20	2026-10-28 03:01:17.597	12	1
20	ENTRADA	27	Inventario inicial integrado con catálogo oficial web	0	27	2026-10-28 03:01:17.606	13	1
21	ENTRADA	34	Inventario inicial integrado con catálogo oficial web	0	34	2026-10-28 03:01:17.611	14	1
22	ENTRADA	41	Inventario inicial integrado con catálogo oficial web	0	41	2026-10-28 03:01:17.616	15	1
23	ENTRADA	48	Inventario inicial integrado con catálogo oficial web	0	48	2026-10-28 03:01:17.621	16	1
24	ENTRADA	55	Inventario inicial integrado con catálogo oficial web	0	55	2026-10-28 03:01:17.627	17	1
25	ENTRADA	62	Inventario inicial integrado con catálogo oficial web	0	62	2026-10-28 03:01:17.632	18	1
26	ENTRADA	24	Inventario inicial integrado con catálogo oficial web	0	24	2026-10-28 03:01:17.637	19	1
27	ENTRADA	31	Inventario inicial integrado con catálogo oficial web	0	31	2026-10-28 03:01:17.642	20	1
28	ENTRADA	38	Inventario inicial integrado con catálogo oficial web	0	38	2026-10-28 03:01:17.646	21	1
29	ENTRADA	45	Inventario inicial integrado con catálogo oficial web	0	45	2026-10-28 03:01:17.65	22	1
30	ENTRADA	52	Inventario inicial integrado con catálogo oficial web	0	52	2026-10-28 03:01:17.654	23	1
31	ENTRADA	59	Inventario inicial integrado con catálogo oficial web	0	59	2026-10-28 03:01:17.659	24	1
32	ENTRADA	21	Inventario inicial integrado con catálogo oficial web	0	21	2026-10-28 03:01:17.665	25	1
33	ENTRADA	28	Inventario inicial integrado con catálogo oficial web	0	28	2026-10-28 03:01:17.671	26	1
34	ENTRADA	35	Inventario inicial integrado con catálogo oficial web	0	35	2026-10-28 03:01:17.677	27	1
35	ENTRADA	42	Inventario inicial integrado con catálogo oficial web	0	42	2026-10-28 03:01:17.681	28	1
36	ENTRADA	49	Inventario inicial integrado con catálogo oficial web	0	49	2026-10-28 03:01:17.687	29	1
37	ENTRADA	56	Inventario inicial integrado con catálogo oficial web	0	56	2026-10-28 03:01:17.692	30	1
38	ENTRADA	63	Inventario inicial integrado con catálogo oficial web	0	63	2026-10-28 03:01:17.697	31	1
39	ENTRADA	25	Inventario inicial integrado con catálogo oficial web	0	25	2026-10-28 03:01:17.702	32	1
40	ENTRADA	32	Inventario inicial integrado con catálogo oficial web	0	32	2026-10-28 03:01:17.713	33	1
41	ENTRADA	39	Inventario inicial integrado con catálogo oficial web	0	39	2026-10-28 03:01:17.719	34	1
42	ENTRADA	46	Inventario inicial integrado con catálogo oficial web	0	46	2026-10-28 03:01:17.725	35	1
43	ENTRADA	53	Inventario inicial integrado con catálogo oficial web	0	53	2026-10-28 03:01:17.734	36	1
44	ENTRADA	60	Inventario inicial integrado con catálogo oficial web	0	60	2026-10-28 03:01:17.741	37	1
45	ENTRADA	22	Inventario inicial integrado con catálogo oficial web	0	22	2026-10-28 03:01:17.747	38	1
46	ENTRADA	29	Inventario inicial integrado con catálogo oficial web	0	29	2026-10-28 03:01:17.756	39	1
47	ENTRADA	36	Inventario inicial integrado con catálogo oficial web	0	36	2026-10-28 03:01:17.762	40	1
48	ENTRADA	43	Inventario inicial integrado con catálogo oficial web	0	43	2026-10-28 03:01:17.767	41	1
49	ENTRADA	50	Inventario inicial integrado con catálogo oficial web	0	50	2026-10-28 03:01:17.774	42	1
50	ENTRADA	57	Inventario inicial integrado con catálogo oficial web	0	57	2026-10-28 03:01:17.782	43	1
51	ENTRADA	64	Inventario inicial integrado con catálogo oficial web	0	64	2026-10-28 03:01:17.788	44	1
52	ENTRADA	26	Inventario inicial integrado con catálogo oficial web	0	26	2026-10-28 03:01:17.795	45	1
53	ENTRADA	33	Inventario inicial integrado con catálogo oficial web	0	33	2026-10-28 03:01:17.803	46	1
54	ENTRADA	40	Inventario inicial integrado con catálogo oficial web	0	40	2026-10-28 03:01:17.809	47	1
55	ENTRADA	47	Inventario inicial integrado con catálogo oficial web	0	47	2026-10-28 03:01:17.816	48	1
56	ENTRADA	54	Inventario inicial integrado con catálogo oficial web	0	54	2026-10-28 03:01:17.823	49	1
57	ENTRADA	61	Inventario inicial integrado con catálogo oficial web	0	61	2026-10-28 03:01:17.829	50	1
58	ENTRADA	23	Inventario inicial integrado con catálogo oficial web	0	23	2026-10-28 03:01:17.834	51	1
59	ENTRADA	30	Inventario inicial integrado con catálogo oficial web	0	30	2026-10-28 03:01:17.84	52	1
60	ENTRADA	37	Inventario inicial integrado con catálogo oficial web	0	37	2026-10-28 03:01:17.848	53	1
61	ENTRADA	44	Inventario inicial integrado con catálogo oficial web	0	44	2026-10-28 03:01:17.853	54	1
62	ENTRADA	51	Inventario inicial integrado con catálogo oficial web	0	51	2026-10-28 03:01:17.858	55	1
63	ENTRADA	58	Inventario inicial integrado con catálogo oficial web	0	58	2026-10-28 03:01:17.864	56	1
64	ENTRADA	20	Inventario inicial integrado con catálogo oficial web	0	20	2026-10-28 03:01:17.871	57	1
65	ENTRADA	27	Inventario inicial integrado con catálogo oficial web	0	27	2026-10-28 03:01:17.877	58	1
66	ENTRADA	34	Inventario inicial integrado con catálogo oficial web	0	34	2026-10-28 03:01:17.883	59	1
67	ENTRADA	41	Inventario inicial integrado con catálogo oficial web	0	41	2026-10-28 03:01:17.889	60	1
68	ENTRADA	48	Inventario inicial integrado con catálogo oficial web	0	48	2026-10-28 03:01:17.895	61	1
69	ENTRADA	55	Inventario inicial integrado con catálogo oficial web	0	55	2026-10-28 03:01:17.899	62	1
70	ENTRADA	62	Inventario inicial integrado con catálogo oficial web	0	62	2026-10-28 03:01:17.903	63	1
71	ENTRADA	24	Inventario inicial integrado con catálogo oficial web	0	24	2026-10-28 03:01:17.912	64	1
72	ENTRADA	31	Inventario inicial integrado con catálogo oficial web	0	31	2026-10-28 03:01:17.917	65	1
73	ENTRADA	38	Inventario inicial integrado con catálogo oficial web	0	38	2026-10-28 03:01:17.921	66	1
74	ENTRADA	45	Inventario inicial integrado con catálogo oficial web	0	45	2026-10-28 03:01:17.926	67	1
75	ENTRADA	52	Inventario inicial integrado con catálogo oficial web	0	52	2026-10-28 03:01:17.933	68	1
76	ENTRADA	59	Inventario inicial integrado con catálogo oficial web	0	59	2026-10-28 03:01:17.937	69	1
77	ENTRADA	21	Inventario inicial integrado con catálogo oficial web	0	21	2026-10-28 03:01:17.942	70	1
78	ENTRADA	28	Inventario inicial integrado con catálogo oficial web	0	28	2026-10-28 03:01:17.947	71	1
79	ENTRADA	35	Inventario inicial integrado con catálogo oficial web	0	35	2026-10-28 03:01:17.952	72	1
80	ENTRADA	42	Inventario inicial integrado con catálogo oficial web	0	42	2026-10-28 03:01:17.957	73	1
81	ENTRADA	49	Inventario inicial integrado con catálogo oficial web	0	49	2026-10-28 03:01:17.961	74	1
82	ENTRADA	56	Inventario inicial integrado con catálogo oficial web	0	56	2026-10-28 03:01:17.966	75	1
83	ENTRADA	63	Inventario inicial integrado con catálogo oficial web	0	63	2026-10-28 03:01:17.971	76	1
84	ENTRADA	25	Inventario inicial integrado con catálogo oficial web	0	25	2026-10-28 03:01:17.975	77	1
85	ENTRADA	32	Inventario inicial integrado con catálogo oficial web	0	32	2026-10-28 03:01:17.979	78	1
86	ENTRADA	39	Inventario inicial integrado con catálogo oficial web	0	39	2026-10-28 03:01:17.984	79	1
87	ENTRADA	46	Inventario inicial integrado con catálogo oficial web	0	46	2026-10-28 03:01:17.99	80	1
88	ENTRADA	53	Inventario inicial integrado con catálogo oficial web	0	53	2026-10-28 03:01:17.994	81	1
89	ENTRADA	60	Inventario inicial integrado con catálogo oficial web	0	60	2026-10-28 03:01:17.999	82	1
90	ENTRADA	22	Inventario inicial integrado con catálogo oficial web	0	22	2026-10-28 03:01:18.005	83	1
91	ENTRADA	29	Inventario inicial integrado con catálogo oficial web	0	29	2026-10-28 03:01:18.013	84	1
92	ENTRADA	36	Inventario inicial integrado con catálogo oficial web	0	36	2026-10-28 03:01:18.019	85	1
93	ENTRADA	43	Inventario inicial integrado con catálogo oficial web	0	43	2026-10-28 03:01:18.023	86	1
94	ENTRADA	50	Inventario inicial integrado con catálogo oficial web	0	50	2026-10-28 03:01:18.028	87	1
95	ENTRADA	57	Inventario inicial integrado con catálogo oficial web	0	57	2026-10-28 03:01:18.034	88	1
96	ENTRADA	64	Inventario inicial integrado con catálogo oficial web	0	64	2026-10-28 03:01:18.039	89	1
97	ENTRADA	26	Inventario inicial integrado con catálogo oficial web	0	26	2026-10-28 03:01:18.043	90	1
98	ENTRADA	33	Inventario inicial integrado con catálogo oficial web	0	33	2026-10-28 03:01:18.049	91	1
99	ENTRADA	40	Inventario inicial integrado con catálogo oficial web	0	40	2026-10-28 03:01:18.054	92	1
100	ENTRADA	47	Inventario inicial integrado con catálogo oficial web	0	47	2026-10-28 03:01:18.06	93	1
101	ENTRADA	54	Inventario inicial integrado con catálogo oficial web	0	54	2026-10-28 03:01:18.064	94	1
102	ENTRADA	61	Inventario inicial integrado con catálogo oficial web	0	61	2026-10-28 03:01:18.069	95	1
103	ENTRADA	23	Inventario inicial integrado con catálogo oficial web	0	23	2026-10-28 03:01:18.075	96	1
104	ENTRADA	30	Inventario inicial integrado con catálogo oficial web	0	30	2026-10-28 03:01:18.082	97	1
105	ENTRADA	37	Inventario inicial integrado con catálogo oficial web	0	37	2026-10-28 03:01:18.088	98	1
106	ENTRADA	44	Inventario inicial integrado con catálogo oficial web	0	44	2026-10-28 03:01:18.094	99	1
107	ENTRADA	51	Inventario inicial integrado con catálogo oficial web	0	51	2026-10-28 03:01:18.1	100	1
108	ENTRADA	58	Inventario inicial integrado con catálogo oficial web	0	58	2026-10-28 03:01:18.104	101	1
109	ENTRADA	20	Inventario inicial integrado con catálogo oficial web	0	20	2026-10-28 03:01:18.109	102	1
110	ENTRADA	27	Inventario inicial integrado con catálogo oficial web	0	27	2026-10-28 03:01:18.115	103	1
111	ENTRADA	34	Inventario inicial integrado con catálogo oficial web	0	34	2026-10-28 03:01:18.12	104	1
112	ENTRADA	41	Inventario inicial integrado con catálogo oficial web	0	41	2026-10-28 03:01:18.125	105	1
113	ENTRADA	48	Inventario inicial integrado con catálogo oficial web	0	48	2026-10-28 03:01:18.13	106	1
114	ENTRADA	55	Inventario inicial integrado con catálogo oficial web	0	55	2026-10-28 03:01:18.137	107	1
115	ENTRADA	62	Inventario inicial integrado con catálogo oficial web	0	62	2026-10-28 03:01:18.144	108	1
116	ENTRADA	24	Inventario inicial integrado con catálogo oficial web	0	24	2026-10-28 03:01:18.15	109	1
117	ENTRADA	31	Inventario inicial integrado con catálogo oficial web	0	31	2026-10-28 03:01:18.156	110	1
118	ENTRADA	38	Inventario inicial integrado con catálogo oficial web	0	38	2026-10-28 03:01:18.162	111	1
119	ENTRADA	45	Inventario inicial integrado con catálogo oficial web	0	45	2026-10-28 03:01:18.168	112	1
120	ENTRADA	52	Inventario inicial integrado con catálogo oficial web	0	52	2026-10-28 03:01:18.173	113	1
121	ENTRADA	59	Inventario inicial integrado con catálogo oficial web	0	59	2026-10-28 03:01:18.18	114	1
122	ENTRADA	21	Inventario inicial integrado con catálogo oficial web	0	21	2026-10-28 03:01:18.186	115	1
123	ENTRADA	28	Inventario inicial integrado con catálogo oficial web	0	28	2026-10-28 03:01:18.193	116	1
124	ENTRADA	35	Inventario inicial integrado con catálogo oficial web	0	35	2026-10-28 03:01:18.198	117	1
125	ENTRADA	42	Inventario inicial integrado con catálogo oficial web	0	42	2026-10-28 03:01:18.204	118	1
126	ENTRADA	49	Inventario inicial integrado con catálogo oficial web	0	49	2026-10-28 03:01:18.211	119	1
127	ENTRADA	56	Inventario inicial integrado con catálogo oficial web	0	56	2026-10-28 03:01:18.216	120	1
128	ENTRADA	63	Inventario inicial integrado con catálogo oficial web	0	63	2026-10-28 03:01:18.222	121	1
129	ENTRADA	25	Inventario inicial integrado con catálogo oficial web	0	25	2026-10-28 03:01:18.229	122	1
130	ENTRADA	32	Inventario inicial integrado con catálogo oficial web	0	32	2026-10-28 03:01:18.235	123	1
131	ENTRADA	39	Inventario inicial integrado con catálogo oficial web	0	39	2026-10-28 03:01:18.24	124	1
132	ENTRADA	46	Inventario inicial integrado con catálogo oficial web	0	46	2026-10-28 03:01:18.246	125	1
133	ENTRADA	53	Inventario inicial integrado con catálogo oficial web	0	53	2026-10-28 03:01:18.254	126	1
134	ENTRADA	60	Inventario inicial integrado con catálogo oficial web	0	60	2026-10-28 03:01:18.259	127	1
135	ENTRADA	22	Inventario inicial integrado con catálogo oficial web	0	22	2026-10-28 03:01:18.264	128	1
136	ENTRADA	29	Inventario inicial integrado con catálogo oficial web	0	29	2026-10-28 03:01:18.271	129	1
137	ENTRADA	36	Inventario inicial integrado con catálogo oficial web	0	36	2026-10-28 03:01:18.277	130	1
138	ENTRADA	43	Inventario inicial integrado con catálogo oficial web	0	43	2026-10-28 03:01:18.282	131	1
139	ENTRADA	10	Compra adicional de prueba laboratorio Portugal	45	55	2026-10-28 03:11:53.909	112	3
140	SALIDA	1	Venta T-000013	23	22	2026-10-31 19:34:58.209	51	1
141	SALIDA	2	Venta T-000014	46	44	2026-10-31 19:52:53.785	35	1
142	SALIDA	1	Venta T-000015	58	57	2026-10-31 19:59:35.949	101	1
143	SALIDA	3	Venta T-000016	55	52	2026-10-31 22:24:56.957	112	1
144	SALIDA	2	Venta T-000017	37	35	2026-10-31 22:26:24.181	98	1
145	AJUSTE	34	prueba de testeo (Ajuste físico: de 36 a 2)	36	2	2026-11-01 01:29:26.033	130	1
146	ENTRADA	8	Aumento de stock	2	10	2026-11-04 19:25:49.197	130	3
147	SALIDA	2	Venta T-000018	57	55	2026-11-06 02:06:45.835	101	2
148	SALIDA	1	Venta T-000019	52	51	2026-11-06 19:24:15.866	68	2
149	SALIDA	1	Venta T-000020	24	23	2026-11-06 19:25:27.375	19	2
150	SALIDA	1	Venta T-000021	20	19	2026-11-07 01:27:46.703	12	1
151	SALIDA	3	Venta T-000022	19	16	2026-11-07 01:31:54.731	12	1
152	SALIDA	1	Venta T-000022	25	24	2026-11-07 01:31:54.758	32	1
153	SALIDA	2	Venta T-000023	61	59	2026-11-07 01:41:27.8	50	1
154	SALIDA	1	Venta T-000024	25	24	2026-11-07 01:51:30.654	77	1
\.


--
-- Data for Name: Producto; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Producto" (id, "codigoBarras", nombre, "principioActivo", presentacion, laboratorio, costo, precio, stock, "stockMinimo", lote, "fechaVencimiento", imagen, activo, "createdAt", "updatedAt", "categoriaId", "proveedorId") FROM stdin;
12	775000000001	Panadol Antigripal NF	Paracetamol 500mg, Fenilefrina 5mg, Clorfenamina 2mg	Caja x 52 sobres (104 tabletas)	Haleon	1.56	2.40	16	5	L-2026-010	2028-06-30 00:00:00	/media/products/panadol-antigripal-nf.jpg	t	2026-10-28 03:01:17.592	2026-11-07 21:51:51.953	10	1
18	775000000007	Ciprofloxacino IQFarma 500 mg	Ciprofloxacino Clorhidrato 500 mg	Caja x 100 tabletas recubiertas (10 blísteres de 10)	IQFARMA	2.73	4.20	62	5	L-2026-016	2028-06-30 00:00:00	/media/products/ciprofloxacino-500mg-iqfarma.jpg	t	2026-10-28 03:01:17.63	2026-11-07 21:51:51.978	10	1
19	775000000008	Clorfenamina Maleato Portugal 4 mg	Clorfenamina Maleato 4 mg	Caja x 100 tabletas (10 blísteres de 10)	Laboratorios Portugal	0.85	1.30	23	5	L-2026-017	2028-06-30 00:00:00	/media/products/clorfenamina-4mg-portugal.jpg	t	2026-10-28 03:01:17.636	2026-11-07 21:51:51.984	10	1
24	775000000013	Ginkan 500 (Metronidazol 500 mg)	Metronidazol 500 mg	Caja x 8 comprimidos recubiertos	Baliarda	9.04	13.90	59	5	L-2026-022	2028-06-30 00:00:00	/media/products/ginkan-500mg-metronidazol.jpg	t	2026-10-28 03:01:17.657	2026-11-07 21:51:52.002	10	1
20	775000000009	Cefabroncol-S 250 mg / 5 mL Suspensión	Cefalexina Monohidrato 250 mg / 5 mL	Frasco x 60 mL polvo para suspensión oral con cuchara dosificadora	Medifarma	27.49	42.30	31	5	L-2026-018	2028-06-30 00:00:00	/media/products/dexabroncol-jarabe-120ml.jpg	t	2026-10-28 03:01:17.64	2026-11-07 21:51:51.988	10	1
30	775000000019	Plidan Compuesto	Escopolamina butilbromuro 10 mg + Paracetamol 500 mg	Caja x 100 comprimidos recubiertos (10 blísteres de 10)	Megalabs	5.33	8.20	56	5	L-2026-028	2028-06-30 00:00:00	/media/products/plidan-compuesto-nf.jpg	t	2026-10-28 03:01:17.69	2026-11-07 21:51:52.025	10	1
13	775000000002	Apronax 550 mg	Naproxeno Sódico 550 mg	Caja dispensadora x 120 tabletas recubiertas (30 blísteres de 4)	Bayer	4.68	7.20	27	5	L-2026-011	2028-06-30 00:00:00	/media/products/apronax-1.png	t	2026-10-28 03:01:17.604	2026-11-07 21:51:51.958	10	1
14	775000000003	Amoxicilina + Bromhexina NF 500 mg + 8 mg	Amoxicilina Trihidrato 500 mg + Bromhexina Clorhidrato 8 mg	Caja x 100 cápsulas (10 blísteres de 10)	Laboratorios Portugal	3.58	5.50	34	5	L-2026-012	2028-06-30 00:00:00	/media/products/amoxicilina-500mg-medifarma.jpg	t	2026-10-28 03:01:17.609	2026-11-07 21:51:51.962	10	1
21	775000000010	Diclofenaco Genfar 50 mg	Diclofenaco Sódico 50 mg	Caja x 30 tabletas retard (3 blísteres de 10)	Genfar	1.82	2.80	38	5	L-2026-019	2028-06-30 00:00:00	/media/products/diclofenaco-sodico-50mg-portugal.jpg	t	2026-10-28 03:01:17.644	2026-11-07 21:51:51.992	10	1
32	775000000021	Losartán 50 mg IQFARMA	Losartán Potásico 50 mg	Caja x 60 tabletas recubiertas (6 blísteres de 10)	Laboratorio IQFARMA	2.93	4.50	24	5	L-2026-030	2028-06-30 00:00:00	/media/products/losartan-potasico-50mg-medifarma.jpg	t	2026-10-28 03:01:17.7	2026-11-07 21:51:52.032	5	1
25	775000000014	Ibuprofeno Genfar 400 mg	Ibuprofeno 400 mg	Caja x 100 tabletas recubiertas (10 blísteres de 10)	Genfar	0.91	1.40	21	5	L-2026-023	2028-06-30 00:00:00	/media/products/ibuprofeno-400mg-portugal.jpg	t	2026-10-28 03:01:17.663	2026-11-07 21:51:52.005	10	1
22	775000000011	Fluconazol Portugal 150 mg	Fluconazol 150 mg	Caja x 100 cápsulas (Blísteres monodosis)	Laboratorios Portugal	1.63	2.50	45	5	L-2026-020	2028-06-30 00:00:00	/media/products/fluconazol-150mg-medifarma.jpg	t	2026-10-28 03:01:17.649	2026-11-07 21:51:51.995	10	1
26	775000000015	Kitadol Migraña	Paracetamol 500 mg + Cafeína 65 mg	Caja x 80 tabletas recubiertas (40 sobres de 2)	Millet / Medifarma	1.37	2.10	28	5	L-2026-024	2028-06-30 00:00:00	/media/products/kitadol-500mg-paracetamol.jpg	t	2026-10-28 03:01:17.669	2026-11-07 21:51:52.01	10	1
27	775000000016	Loratadina Portugal 10 mg	Loratadina 10 mg	Caja x 100 tabletas (10 blísteres de 10)	Laboratorios Portugal	1.56	2.40	35	5	L-2026-025	2028-06-30 00:00:00	/media/products/loratadina-10mg-genfar.jpg	t	2026-10-28 03:01:17.674	2026-11-07 21:51:52.013	10	1
28	775000000017	Nastizol Junior Antigripal NF	Paracetamol 80 mg, Fenilefrina 1.25 mg, Clorfenamina 0.5 mg	Caja x 20 comprimidos masticables (2 blísteres de 10)	Bagó	3.90	6.00	42	5	L-2026-026	2028-06-30 00:00:00	/media/products/nastizol-compositum.jpg	t	2026-10-28 03:01:17.68	2026-11-07 21:51:52.017	10	1
29	775000000018	Omeprazol Portugal 20 mg	Omeprazol microgránulos entéricos 20 mg	Caja x 100 cápsulas de liberación retardada (10 blísteres de 10)	Laboratorios Portugal	1.82	2.80	49	5	L-2026-027	2028-06-30 00:00:00	/media/products/omeprazol-20mg-genfar.jpg	t	2026-10-28 03:01:17.685	2026-11-07 21:51:52.02	10	1
15	775000000004	Eritromicina Genfar 500 mg	Eritromicina 500 mg	Caja x 50 tabletas recubiertas (5 blísteres de 10)	Genfar	4.68	7.20	41	5	L-2026-013	2028-06-30 00:00:00	/media/products/azitromicina-500mg-genfar.jpg	t	2026-10-28 03:01:17.614	2026-11-07 21:51:51.966	10	1
16	775000000005	Bismutol 262 mg Tabletas Masticables	Subsalicilato de Bismuto 262 mg	Dispensador x 160 tabletas masticables (80 sachets)	Millet / Medifarma	0.98	1.50	48	5	L-2026-014	2028-06-30 00:00:00	/media/products/bismutol-262mg-tabletas.jpg	t	2026-10-28 03:01:17.619	2026-11-07 21:51:51.969	10	1
17	775000000006	Cefalexina Pharma Genéricos 500 mg	Cefalexina Monohidrato 500 mg	Caja x 50 cápsulas (5 blísteres de 10)	Pharma Genéricos	5.33	8.20	55	5	L-2026-015	2028-06-30 00:00:00	/media/products/cefalexina-500mg-medifarma.jpg	t	2026-10-28 03:01:17.624	2026-11-07 21:51:51.974	10	1
23	775000000012	Gaseovet Gotas 80 mg/mL	Simeticona 80 mg / mL	Frasco gotero x 15 mL suspensión oral	Medifarma	14.43	22.20	52	5	L-2026-021	2028-06-30 00:00:00	/media/products/gaseovet-gotas-15ml.jpg	t	2026-10-28 03:01:17.653	2026-11-07 21:51:51.998	10	1
39	775000000028	Carvedilol Genfar 12.5 mg	Carvedilol 12.5 mg	Caja x 30 comprimidos (3 blísteres de 10)	Genfar	2.93	4.50	29	5	L-2026-037	2028-06-30 00:00:00	/media/products/carvedilol-genfar-12-5mg.jpg	t	2026-10-28 03:01:17.752	2026-11-07 21:51:52.056	5	1
37	775000000026	Gliribet 4 mg (Glimepirida) MK	Glimepirida 4 mg	Caja x 30 comprimidos (3 blísteres de 10)	MK / MKT Pharma	7.80	12.00	60	5	L-2026-035	2028-06-30 00:00:00	/media/products/gliribet-4mg-glimepirida-mk.jpg	t	2026-10-28 03:01:17.739	2026-11-07 21:51:52.049	5	1
56	775000000045	Pack Belleza x3 Mason Natural (Biotin + Colágeno + Vit E)	Biotina 800 mcg + Colágeno 1500 + Vitamina E 400 IU	Pack x 3 frascos sellados	Mason Natural USA	29.25	45.00	58	5	L-2026-014	2028-06-30 00:00:00	/media/products/pack-biotin-vitaminae-colageno-mason.jpg	t	2026-10-28 03:01:17.861	2026-11-07 21:51:52.115	6	1
36	775000000025	Metformina Genfar 850 mg	Metformina Clorhidrato 850 mg	Caja x 30 tabletas (3 blísteres de 10)	Genfar	2.28	3.50	53	5	L-2026-034	2028-06-30 00:00:00	/media/products/metformina-850mg-genfar.jpg	t	2026-10-28 03:01:17.73	2026-11-07 21:51:52.046	5	1
38	775000000027	Cardioaspirina 100 EC Bayer	Ácido Acetilsalicílico 100 mg	Caja x 20 comprimidos con cubierta entérica (2 blísteres de 10)	Bayer	5.53	8.50	22	5	L-2026-036	2028-06-30 00:00:00	/media/products/cardioaspirina-100mg-bayer.jpg	t	2026-10-28 03:01:17.744	2026-11-07 21:51:52.053	5	1
40	775000000029	Valsartán AC Farma 80 mg	Valsartán 80 mg	Caja x 30 tabletas (3 blísteres de 10)	AC Farma - Línea DCI	5.53	8.50	36	5	L-2026-038	2028-06-30 00:00:00	/media/products/valsartan-ac-farma-80mg.jpg	t	2026-10-28 03:01:17.76	2026-11-07 21:51:52.06	5	1
41	775000000030	Concor 5 mg (Bisoprolol) Merck	Bisoprolol Fumarato 5 mg	Caja x 30 comprimidos recubiertos (3 blísteres de 10)	Merck KGaA	33.80	52.00	43	5	L-2026-039	2028-06-30 00:00:00	/media/products/concor-5mg-bisoprolol.jpg	t	2026-10-28 03:01:17.765	2026-11-07 21:51:52.063	5	1
42	775000000031	Glibenclamida Portugal 5 mg	Glibenclamida 5 mg	Caja x 100 tabletas (10 blísteres de 10)	Laboratorios Portugal	0.98	1.50	50	5	L-2026-040	2028-06-30 00:00:00	/media/products/glibenclamida-portugal-5mg.jpg	t	2026-10-28 03:01:17.771	2026-11-07 21:51:52.067	5	1
43	775000000032	Eutirox 100 mcg Merck	Levotiroxina Sódica 100 mcg	Caja con 50 tabletas (2 blísteres de 25)	Merck KGaA	21.94	33.75	57	5	L-2026-041	2028-06-30 00:00:00	/media/products/eutirox-100mcg-merck.jpg	t	2026-10-28 03:01:17.779	2026-11-07 21:51:52.071	5	1
44	775000000033	Clopidogrel Portugal 75 mg	Clopidogrel Bisulfato 75 mg	Caja x 30 tabletas recubiertas (3 blísteres de 10)	Laboratorios Portugal	6.37	9.80	64	5	L-2026-042	2028-06-30 00:00:00	/media/products/clopidogrel-portugal-75mg.jpg	t	2026-10-28 03:01:17.785	2026-11-07 21:51:52.074	5	1
45	775000000034	Hidroclorotiazida IQFARMA 25 mg	Hidroclorotiazida 25 mg	Caja x 100 tabletas (10 blísteres de 10)	Laboratorio IQFARMA	1.43	2.20	26	5	L-2026-043	2028-06-30 00:00:00	/media/products/hidroclorotiazida-iqfarma-25mg.jpg	t	2026-10-28 03:01:17.792	2026-11-07 21:51:52.077	5	1
46	775000000035	Espironolactona Farmindustria 25 mg	Espironolactona 25 mg	Caja x 100 tabletas recubiertas (10 blísteres de 10)	Farmindustria	2.47	3.80	33	5	L-2026-044	2028-06-30 00:00:00	/media/products/espironolactona-farmindustria-25mg.jpg	t	2026-10-28 03:01:17.8	2026-11-07 21:51:52.08	5	1
47	775000000036	Rosuvastatina Genfar 10 mg	Rosuvastatina Cálcica 10 mg	Caja x 14 comprimidos recubiertos (1 blíster de 14)	Genfar	10.73	16.50	40	5	L-2026-045	2028-06-30 00:00:00	/media/products/rosuvastatina-genfar-10mg.jpg	t	2026-10-28 03:01:17.807	2026-11-07 21:51:52.084	5	1
48	775000000037	Januvia 100 mg (Sitagliptina) MSD	Sitagliptina Fosfato Monohidrato 100 mg	Caja con 14 comprimidos recubiertos (1 blíster de 14)	MSD / Merck Sharp & Dohme	36.89	56.75	47	5	L-2026-046	2028-06-30 00:00:00	/media/products/januvia-100mg-msd.jpg	t	2026-10-28 03:01:17.812	2026-11-07 21:51:52.087	5	1
49	775000000038	Aero OM Forte 125 mg Sabor Anís OM Pharma	Simeticona 125 mg sabor anís	Caja x 20 comprimidos masticables (2 blísteres de 10)	OM Pharma	7.48	11.50	54	5	L-2026-047	2028-06-30 00:00:00	/media/products/aero-om-forte-125mg.jpg	t	2026-10-28 03:01:17.82	2026-11-07 21:51:52.091	5	1
50	775000000039	Glucerna Vainilla Abbott 850 g	Carbohidratos de digestión lenta, proteínas, 28 vitaminas y minerales	Lata x 850 g en polvo (Rinde aprox 15 tomas)	Abbott	84.44	129.90	59	5	L-2026-048	2028-06-30 00:00:00	/media/products/glucerna-sr-vainilla-850g.jpg	t	2026-10-28 03:01:17.827	2026-11-07 21:51:52.094	5	1
52	775000000041	Dolo Neurobión Forte NF	Tiamina B1, Piridoxina B6, Cianocobalamina B12, Diclofenaco sódico	Blíster x 4 cápsulas (Caja dispensadora x 200 cápsulas)	P&G Health	7.80	12.00	30	5	L-2026-010	2028-06-30 00:00:00	/media/products/dolo-neurobion-forte-nf.jpg	t	2026-10-28 03:01:17.838	2026-11-07 21:51:52.101	6	1
54	775000000043	Ensure Advance con HMB Fresa-Plátano 850 g	NutriVigor con HMB, Proteínas, Calcio, Vitamina D3	Lata x 850 g en polvo (Rinde aprox 16 tomas)	Abbott	84.44	129.90	44	5	L-2026-012	2028-06-30 00:00:00	/media/products/ensure-advance-fresa-platano-850g.jpg	t	2026-10-28 03:01:17.851	2026-11-07 21:51:52.108	6	1
55	775000000044	Redoxon Total Naranja (30 Comprimidos)	Ácido Ascórbico 1000 mg + Vitamina D 10 mcg + Zinc 10 mg	Caja x 30 comprimidos efervescentes (3 tubos de 10)	Bayer	10.08	15.50	51	5	L-2026-013	2028-06-30 00:00:00	/media/products/redoxon-vitamina-c-1000mg-10tabs.jpg	t	2026-10-28 03:01:17.856	2026-11-07 21:51:52.112	6	1
57	775000000046	Centrum Silver Men 50+ (200 Tablets)	Fórmula de 24 micronutrientes bioactivos para hombres 50+	Frasco grande x 200 tabletas	Haleon / Centrum	97.44	149.90	20	5	L-2026-015	2028-06-30 00:00:00	/media/products/centrum-silver-men-50plus-200tabs.jpg	t	2026-10-28 03:01:17.868	2026-11-07 21:51:52.119	6	1
58	775000000047	Centrum Silver Women 50+ (200 Tablets)	Complejo vitamínico mineral optimizado para mujeres 50+	Frasco grande x 200 tabletas	Haleon / Centrum	97.44	149.90	27	5	L-2026-016	2028-06-30 00:00:00	/media/products/centrum-silver-women-50plus-200tabs.jpg	t	2026-10-28 03:01:17.874	2026-11-07 21:51:52.122	6	1
59	775000000048	Colágeno Hidrolizado 1500 Plus Mason Natural (60 Cápsulas)	Colágeno Hidrolizado 1500 mg + Biotina + Vitamina C	Frasco x 60 cápsulas	Mason Natural USA	45.44	69.90	34	5	L-2026-017	2028-06-30 00:00:00	/media/products/colageno-hidrolizado-1500-plus-mason.jpg	t	2026-10-28 03:01:17.881	2026-11-07 21:51:52.126	6	1
33	7861051637750	Amlodipino Genfar 5 mg	Amlodipino Besilato 5 mg	Caja x 10 tabletas (Blíster de 10)	Genfar	2.08	3.20	32	5	L-2026-031	2028-06-30 05:00:00	/media/products/amlodipino-5mg-genfar.jpg	t	2026-10-28 03:01:17.708	2026-11-07 21:51:52.036	5	1
34	775000000023	Enalapril Portugal 20 mg	Enalapril Maleato 20 mg	Caja x 100 tabletas (10 blísteres de 10)	Laboratorios Portugal	1.63	2.50	39	5	L-2026-032	2028-06-30 00:00:00	/media/products/enalapril-20mg-medifarma.jpg	t	2026-10-28 03:01:17.717	2026-11-07 21:51:52.039	5	1
35	775000000024	Atorvastatina Portugal 20 mg	Atorvastatina Cálcica 20 mg	Caja x 10 tabletas recubiertas (1 blíster de 10)	Laboratorios Portugal	3.12	4.80	44	5	L-2026-033	2028-06-30 00:00:00	/media/products/atorvastatina-20mg-medifarma.jpg	t	2026-10-28 03:01:17.722	2026-11-07 21:51:52.042	5	1
63	775000000052	Sunvit Life Gluc 500 / Chond 400 & MSM (90 Tablets)	Glucosamina Sulfato 500 mg + Condroitina Sulfato 400 mg + MSM	Frasco x 90 tabletas	Sunvit Life USA	58.44	89.90	62	5	L-2026-021	2028-06-30 00:00:00	/media/products/glucosamina-condroitina-msm-mason.jpg	t	2026-10-28 03:01:17.902	2026-11-07 21:51:52.139	6	1
64	775000000053	Sunvit Life Ginkgo Biloba 60 mg (90 Tablets)	Extracto estandarizado de hojas de Ginkgo Biloba 60 mg	Frasco x 90 tabletas	Sunvit Life USA	38.94	59.90	24	5	L-2026-022	2028-06-30 00:00:00	/media/products/sunvit-ginkgo-biloba-60mg-90tabs.jpg	t	2026-10-28 03:01:17.909	2026-11-07 21:51:52.144	6	1
65	775000000054	Nature's Bounty Zinc 50 mg (250 Caplets)	Gluconato de Zinc 50 mg	Frasco grande x 250 caplets	Nature's Bounty USA	51.94	79.90	31	5	L-2026-023	2028-06-30 00:00:00	/media/products/zinc-50mg-mason-natural.jpg	t	2026-10-28 03:01:17.915	2026-11-07 21:51:52.147	6	1
66	775000000055	Supradyn Multivitamínico Bayer (30 Grageas)	12 vitaminas esenciales, 8 minerales y oligoelementos	Caja x 30 grageas (3 blísteres de 10)	Bayer	10.73	16.50	38	5	L-2026-024	2028-06-30 00:00:00	/media/products/supradyn-pronatal-bayer-30tabs.jpg	t	2026-10-28 03:01:17.92	2026-11-07 21:51:52.151	6	1
67	775000000056	Naturcol Isoflavonas 100 mg/día (100 Cápsulas)	Isoflavonas de Soya 100 mg + Vitaminas C, D3, B12, Hierro, Zinc y Calcio	Frasco x 100 cápsulas	Naturcol	35.69	54.90	45	5	L-2026-025	2028-06-30 00:00:00	/media/products/isoflavonas-soya-sundown.jpg	t	2026-10-28 03:01:17.924	2026-11-07 21:51:52.155	6	1
69	775000000058	Mason Natural Spirulina 500 mg (100 Tablets)	Alga Spirulina platensis micronizada 500 mg	Frasco x 100 tabletas	Mason Natural USA	34.39	52.90	59	5	L-2026-027	2028-06-30 00:00:00	/media/products/mason-natural-spirulina-500mg-100tabs.jpg	t	2026-10-28 03:01:17.936	2026-11-07 21:51:52.161	6	1
70	775000000059	Mason Natural Vitamina E 400 IU / 180 mg (100 Softgels)	Vitamina E  400 IU / 180 mg (Mason Natural USA)	Frasco x 100 cápsulas blandas (softgels)	dl-Alfa Tocoferil Acetato	31.79	48.90	21	5	L-2026-028	2028-06-30 00:00:00	/media/products/mason-natural-vitamina-e-400ui-100softgels.jpg	t	2026-10-28 03:01:17.94	2026-11-07 21:51:52.165	6	1
71	775000000060	Enterogermina PLUS 4000 Millones Sanofi (5 Frascos)	Esporas de Bacillus clausii polifarmacorresistente 4000 millones / 5 mL	Caja x 5 frascos bebibles de 5 mL (Toma 1 vez al día)	Sanofi	5.59	8.60	28	5	L-2026-029	2028-06-30 00:00:00	/media/products/enterogermina-2-billones-10viales.jpg	t	2026-10-28 03:01:17.945	2026-11-07 21:51:52.168	6	1
72	775000000061	Fotoprotector ISDIN Fusion Water Magic SPF 50	Filtros fotoestables UVA/UVB, Ácido Hialurónico, Vitamina E · ISDIN España	Frasco dosificador x 50 ml / Textura ultraligera al tacto	Nova Salud Lab	68.19	104.90	35	5	L-2026-030	2028-06-30 00:00:00	/media/products/fotoprotector-isdin-fusion-water-magic-spf50.jpg	t	2026-10-28 03:01:17.951	2026-11-07 21:51:52.172	7	1
73	775000000062	La Roche-Posay Anthelios UVMune 400 Fluido Invisible SPF 50+	Mexoryl 400, Tecnología Netlock, Agua Termal La Roche-Posay · L'Oréal Francia	Frasco con agitador x 50 ml / Acabado mate invisible	Nova Salud Lab	71.44	109.90	42	5	L-2026-031	2028-06-30 00:00:00	/media/products/la-roche-posay-anthelios-uvmune-400-spf50-50ml.jpg	t	2026-10-28 03:01:17.955	2026-11-07 21:51:52.175	7	1
74	775000000063	Protector Solar Eucerin Sun Oil Control Tono Medio FPS 50+	L-Carnitina, Pigmentos Minerales, Ácido Glicirretínico, Licochalcona A · Beiersdorf Alemania	Frasco con bomba dispensadora x 50 ml / Toque seco mate	Nova Salud Lab	64.94	99.90	49	5	L-2026-032	2028-06-30 00:00:00	/media/products/protector-solar-facial-eucerin-sun-oil-control-tono-medio-fps-50.jpg	t	2026-10-28 03:01:17.959	2026-11-07 21:51:52.178	7	1
75	775000000064	Protector Solar ISDIN Eryfotona AK-NMSC Fluid FPS 99+	Fotoliasa , Filtros UVA/UVB FPS 99+, Bisabolol · ISDIN	Frasco dosificador x 50 ml / Fluido reparador de grado dermatológico	DNA Repairsomes	90.94	139.90	56	5	L-2026-033	2028-06-30 00:00:00	/media/products/protector-solar-eryfotona-aknmsc-fluid-fps99.jpg	t	2026-10-28 03:01:17.964	2026-11-07 21:51:52.182	7	1
76	775000000065	Bruma Facial Babaria Aloe & Niacinamida FPS 50	Aloe Vera 100% puro, Niacinamida , Filtros solares SPF 50 · Babaria España	Frasco spray aerosol x 75 ml / Aplicación 360° invisible	Vitamina B3	21.26	32.70	63	5	L-2026-034	2028-06-30 00:00:00	/media/products/bruma-facial-refrescante-babaria-con-aloe-y-niacinamida-50-spf.jpg	t	2026-10-28 03:01:17.969	2026-11-07 21:51:52.186	7	1
78	775000000067	CeraVe Crema Hidratante Piel Seca a Muy Seca 454 g	3 Ceramidas Esenciales, Ácido Hialurónico, Tecnología MVE · CeraVe	Pote sellado x 454 g (16 oz) / Hidratación intensiva 24h	Nova Salud Lab	58.44	89.90	32	5	L-2026-036	2028-06-30 00:00:00	/media/products/crema-hidratante-cerave-piel-seca-a-muy-seca.jpg	t	2026-10-28 03:01:17.978	2026-11-07 21:51:52.194	7	1
79	775000000068	La Roche-Posay Effaclar Gel Limpiador Purificante 400 ml	Zinc PCA seborregulador, Agua Termal de La Roche-Posay · L'Oréal Cosmétique Active	Frasco dosificador con dispensador x 400 ml	Nova Salud Lab	74.69	114.90	39	5	L-2026-037	2028-06-30 00:00:00	/media/products/gel-limpiador-la-roche-posay-effaclar.jpg	t	2026-10-28 03:01:17.982	2026-11-07 21:51:52.198	7	1
80	775000000069	Cetaphil Loción Limpiadora Piel Sensible 473 ml	Niacinamida , Pantenol (Pro-Vitamina B5), Glicerina · Galderma	Frasco con bomba dosificadora x 473 ml / Hipoalergénico	Vitamina B3	55.19	84.90	46	5	L-2026-038	2028-06-30 00:00:00	/media/products/locion-limpiadora-cetaphil-piel-sensible.jpg	t	2026-10-28 03:01:17.988	2026-11-07 21:51:52.201	7	1
81	775000000070	La Roche-Posay Cicaplast Baume B5+ Reparador 100 ml	Tribioma prebiótico, Pantenol 5%, Madecasósido, Zinc, Manganeso · La Roche-Posay	Tubo flexible x 100 ml / Fórmula hipoalergénica para toda la familia	Nova Salud Lab	58.44	89.90	53	5	L-2026-039	2028-06-30 00:00:00	/media/products/crema-reparadora-la-roche-posay-cicaplast-baume-b5.jpg	t	2026-10-28 03:01:17.992	2026-11-07 21:51:52.204	7	1
103	775000000092	Bepanthen Baby Crema Protectora Antirrozaduras 100 g	Dexpantenol  5%, Lanolina de grado médico · Bayer	Tubo de aluminio sellado x 100 g / Protección hipoalergénica	Pro-Vitamina B5	25.03	38.50	27	5	L-2026-021	2028-06-30 00:00:00	/media/products/bepanthen-baby-crema-protectora.jpg	t	2026-10-28 03:01:18.113	2026-11-07 21:51:52.282	8	1
60	775000000049	Sunvit Life Fish Oil 1000 mg (100 Softgels)	Aceite puro de pescado 1000 mg  (Sunvit Life USA)	Frasco x 100 cápsulas blandas (softgels)	Omega-3 EPA/DHA	38.94	59.90	41	5	L-2026-018	2028-06-30 00:00:00	/media/products/omega-3-sundown-1000mg.jpg	t	2026-10-28 03:01:17.886	2026-11-07 21:51:52.129	6	1
61	775000000050	Sunvit Life B-Complex Daily Care (100 Tablets)	Vitaminas del complejo B  (Sunvit Life USA)	Frasco x 100 tabletas	B1, B2, B3, B5, B6, B12, Biotina, Ácido Fólico	32.44	49.90	48	5	L-2026-019	2028-06-30 00:00:00	/media/products/b-complejo-forte-hersil.jpg	t	2026-10-28 03:01:17.893	2026-11-07 21:51:52.132	6	1
62	775000000051	Citrato de Magnesio Mujer Aguaje (60 Cápsulas)	Citrato de Magnesio 100% puro en cápsulas vegetales	Frasco x 60 cápsulas	Mujer Aguaje	32.44	49.90	55	5	L-2026-020	2028-06-30 00:00:00	/media/products/citrato-de-magnesio-mason-natural.jpg	t	2026-10-28 03:01:17.898	2026-11-07 21:51:52.136	6	1
85	775000000074	Vichy Agua Termal Mineralizante Volcánica 300 ml	15 Minerales volcánicos naturales puros, Calcio, Manganeso, Silicio · Laboratorios Vichy	Frasco spray presurizado x 300 ml / 100% pura y natural	Nova Salud Lab	55.19	84.90	36	5	L-2026-043	2028-06-30 00:00:00	/media/products/agua-termal-volcanica-vichy.jpg	t	2026-10-28 03:01:18.017	2026-11-07 21:51:52.218	7	1
86	775000000075	Sérum Eucerin Hyaluron-Filler Epigenetic 30 ml	Epicelline® epigenético, Ácido Hialurónico macro y micromolecular · Eucerin Alemania	Frasco de vidrio premium con gotero de precisión x 30 ml	Nova Salud Lab	116.94	179.90	43	5	L-2026-044	2028-06-30 00:00:00	/media/products/serum-eucerin-hyaluron-filler-3x-effect-epigenetic.jpg	t	2026-10-28 03:01:18.021	2026-11-07 21:51:52.221	7	1
88	775000000077	CeraVe Sérum Retinol Anti-Marcas Renovador 30 ml	Retinol encapsulado, Extracto de Regaliz, 3 Ceramidas esenciales, Niacinamida · CeraVe	Frasco dispensador pump hermético x 30 ml / Textura gel ligera	Nova Salud Lab	61.69	94.90	57	5	L-2026-046	2028-06-30 00:00:00	/media/products/serum-retinol-cerave-anti-marcas.jpg	t	2026-10-28 03:01:18.032	2026-11-07 21:51:52.228	7	1
89	775000000078	Sesderma C-Vit 5 Glowing Sérum Liposomado 30 ml	5 derivados de Vitamina C liposomada, Ácido Hialurónico, Centella Asiática · Sesderma España	Frasco de vidrio ámbar con cuentagotas dosificador x 30 ml	Nova Salud Lab	110.44	169.90	64	5	L-2026-047	2028-06-30 00:00:00	/media/products/serum-liposomado-sesderma-c-vit-5-glowing.jpg	t	2026-10-28 03:01:18.037	2026-11-07 21:51:52.232	7	1
90	775000000079	ISDIN Si-Nails Fortalecedor de Uñas 2.5 ml	Ácido Hialurónico catiónico, Silicio orgánico, Aceite de Pistacia lentiscus · ISDIN	Lápiz aplicador 'one-click' con pincel x 2.5 ml	Nova Salud Lab	71.44	109.90	26	5	L-2026-048	2028-06-30 00:00:00	/media/products/fortalecedor-de-unas-isdin-sinails.jpg	t	2026-10-28 03:01:18.042	2026-11-07 21:51:52.236	7	1
91	775000000080	Uriage Xémose Stick Labial Hidratante 4 g	Manteca de Karité, Aceite de Borraja, Vitaminas C y E, Ácido Hialurónico · Uriage Francia	Stick retráctil x 4 g / Cuidado labial hipoalergénico	Nova Salud Lab	28.54	43.90	33	5	L-2026-049	2028-06-30 00:00:00	/media/products/lipstick-uriage-xemose-moisturizing.jpg	t	2026-10-28 03:01:18.047	2026-11-07 21:51:52.24	7	1
92	775000000081	NAN 1 Optipro HMO Fórmula Infantil de Inicio en Polvo 800 g	HMO 2'-FL, Proteína Optipro, DHA/ARA, Bífidobacterias B. lactis · Nestlé Suiza	Lata metálica hermética x 800 g / Incluye cucharilla dosificadora	Nova Salud Lab	55.19	84.90	40	5	L-2026-010	2028-06-30 00:00:00	/media/products/nan-1-optipro-hmo-formula-lactea-infantil-de-inicio-en-polvo.jpg	t	2026-10-28 03:01:18.052	2026-11-07 21:51:52.243	8	1
93	775000000082	NAN 2 Optipro HMO Fórmula Láctea de Continuación 800 g	Proteína Optipro, HMO 2'-FL, DHA, Hierro quelado, Vitaminas A-C-D · Nestlé	Lata metálica con sello higiénico x 800 g	Nova Salud Lab	53.89	82.90	47	5	L-2026-011	2028-06-30 00:00:00	/media/products/nan-2-optipro-hmo-formula-lactea-de-continuacion-en-polvo.jpg	t	2026-10-28 03:01:18.058	2026-11-07 21:51:52.247	8	1
94	775000000083	Nutramigen Premium con LGG Hipoalergénica 357 g	Caseína extensamente hidrolizada, Probiótico LGG, DHA y ARA · Mead Johnson Nutrition	Lata sellada al vacío x 357 g / Grado médico nutricional	Nova Salud Lab	82.49	126.90	54	5	L-2026-012	2028-06-30 00:00:00	/media/products/nutramigen-premium-con-lgg.jpg	t	2026-10-28 03:01:18.062	2026-11-07 21:51:52.25	8	1
95	775000000084	Similac Total Comfort KID Alimento en Polvo 820 g	Proteína de suero parcialmente hidrolizada, Prebióticos FOS, DHA, Luteína · Abbott Laboratories	Lata hermética x 820 g con medidor dosificador	Nova Salud Lab	61.69	94.90	61	5	L-2026-013	2028-06-30 00:00:00	/media/products/similac-total-comfort-kid-alimento-en-polvo.jpg	t	2026-10-28 03:01:18.067	2026-11-07 21:51:52.254	8	1
96	775000000085	Pentasure 2.0 Sabor Vainilla Polvo Oral 400 g	Proteína de suero de leche, Caseinato, TCM, Maltodextrina, 28 Micronutrientes · Fresenius Kabi	Lata metálica x 400 g / Sabor suave a Vainilla	Nova Salud Lab	61.75	95.00	23	5	L-2026-014	2028-06-30 00:00:00	/media/products/pentasure-20-sabor-vainilla-polvo-oral.jpg	t	2026-10-28 03:01:18.073	2026-11-07 21:51:52.257	8	1
97	775000000086	Pedialyte Max 60 Solución Rehidratante Sabor Fresa 500 ml	Sodio 60 mEq/L, Potasio 20 mEq/L, Glucosa, Zinc gluconato · Abbott	Frasco PET sellado x 500 ml con tapa dosificadora	Nova Salud Lab	7.02	10.80	30	5	L-2026-015	2028-06-30 00:00:00	/media/products/pedialyte-max-60-sabor-fresa.jpg	t	2026-10-28 03:01:18.08	2026-11-07 21:51:52.26	8	1
98	775000000087	Panadol Niños 160 mg / 5 ml Jarabe 118 ml	Paracetamol 160 mg por cada 5 ml, Libre de alcohol y azúcar · Haleon	Frasco x 118 ml con vasito dosificador ergonómico	Nova Salud Lab	11.38	17.50	35	5	L-2026-016	2028-06-30 00:00:00	/media/products/panadol-ninos-160mg-5ml-jarabe.jpg	t	2026-10-28 03:01:18.086	2026-11-07 21:51:52.264	8	1
99	775000000088	Panadol Pediátrico Gotas 100 mg / ml Frasco 15 ml	Paracetamol 100 mg/ml, Sin azúcar, sabor frutas · Haleon	Frasco gotero graduado con bulbo de precisión x 15 ml	Nova Salud Lab	9.04	13.90	44	5	L-2026-017	2028-06-30 00:00:00	/media/products/panadol-pediatrico-100mg-ml-solucion-oral.jpg	t	2026-10-28 03:01:18.091	2026-11-07 21:51:52.267	8	1
100	775000000089	Ibuprofeno Pediátrico 100 mg / 5 ml Suspensión Oral 120 ml	Ibuprofeno 100 mg/5 ml, Excipientes sabor naranja c.s.p. · Medifarma	Frasco sellado x 120 ml con jeringa dosificadora pediátrica	Nova Salud Lab	4.49	6.90	51	5	L-2026-018	2028-06-30 00:00:00	/media/products/ibuprofeno-100mg-5ml-suspension-oral.jpg	t	2026-10-28 03:01:18.098	2026-11-07 21:51:52.271	8	1
102	775000000091	BioGaia Protectis Baby Gotas Probióticas 5 ml	Limosilactobacillus reuteri Protectis 10^8 UFC en 5 gotas · BioGaia Suecia	Frasco gotero de vidrio ámbar con tira desecante x 5 ml	Nova Salud Lab	37.96	58.40	20	5	L-2026-020	2028-06-30 00:00:00	/media/products/biogaia-protectis-baby-gotas-suspension-oral.jpg	t	2026-10-28 03:01:18.108	2026-11-07 21:51:52.278	8	1
82	775000000071	Bioderma Sensibio H2O Solución Micelar 500 ml	Tecnología Micelar Ésteres de Glicerol, Extracto de Pepino, Complejo D.A.F. · NAOS Francia	Frasco x 500 ml / Limpieza sin aclarado	Nova Salud Lab	58.44	89.90	60	5	L-2026-040	2028-06-30 00:00:00	/media/products/agua-micelar-sensibio-h2o-bioderma-500ml.jpg	t	2026-10-28 03:01:17.997	2026-11-07 21:51:52.208	7	1
83	775000000072	Bioderma Atoderm Huile de Douche 1 Litro	Biolípidos vegetales, Niacinamida , Skin Barrier Therapy · Bioderma	Botella dispensadora con dosificador x 1000 ml	Vitamina PP	84.44	129.90	22	5	L-2026-041	2028-06-30 00:00:00	/media/products/aceite-de-ducha-bioderma-atoderm-huile-piel-seca-a-muy-seca.jpg	t	2026-10-28 03:01:18.002	2026-11-07 21:51:52.211	7	1
84	775000000073	Avène Agua Termal Spray Piel Sensible 300 ml	100% Agua Termal de Avène bacteriologicamente pura · Pierre Fabre Francia	Spray estéril presurizado x 300 ml / Pulverización micronizada	Nova Salud Lab	60.13	92.50	29	5	L-2026-042	2028-06-30 00:00:00	/media/products/agua-termal-avene-para-piel-sensible.jpg	t	2026-10-28 03:01:18.01	2026-11-07 21:51:52.215	7	1
107	775000000096	Cloruro de Sodio 0.9% Solución para Perfusión / Lavado 100 ml	Cloruro de Sodio 0.9%, Agua para inyección estéril c.s.p. 100 ml · Laboratorios Medifarma / Baxter	Frasco plástico colapsable VIAFLEX / estéril x 100 ml	Nova Salud Lab	3.25	5.00	55	5	L-2026-025	2028-06-30 00:00:00	/media/products/cloruro-de-sodio-9-solucion-para-perfusion.jpg	t	2026-10-28 03:01:18.134	2026-11-07 21:51:52.295	8	1
108	775000000097	Aspirador Nasal Anatómico Owawa con Filtro Protector	Silicona médica grado alimentario libre de BPA, Filtro de algodón · Owawa Baby Care	Estuche rígido higiénico con aspirador, manguera y boquillas de recambio	Nova Salud Lab	22.69	34.90	62	5	L-2026-026	2028-06-30 00:00:00	/media/products/aspirador-nasal-owawa.jpg	t	2026-10-28 03:01:18.142	2026-11-07 21:51:52.299	8	1
109	775000000098	Termómetro Digital Clínico Punta Rígida de Alta Precisión	Sensor térmico de precisión, Pantalla LCD, Carcasa hermética lavable	Estuche protector plástico transparente con 1 termómetro digital y pila incluida	Nova Salud Lab	10.99	16.90	24	5	L-2026-027	2028-06-30 00:00:00	/media/products/termometro-digital-punta-rigida.jpg	t	2026-10-28 03:01:18.148	2026-11-07 21:51:52.302	8	1
110	775000000099	Pañal Huggies Dermacare Talla P Paquete x68 Unidades	Polímeros superabsorbentes, Cubierta transpirable Dermacare, Aloe Vera · Kimberly-Clark	Paquete sellado hermético con 68 pañales descartables Talla P	Nova Salud Lab	37.83	58.20	31	5	L-2026-028	2028-06-30 00:00:00	/media/products/panal-huggies-dermacare-talla-p.jpg	t	2026-10-28 03:01:18.153	2026-11-07 21:51:52.306	8	1
111	775000000100	Pampers Premium Care Hipoalergénico Talla M x56 Unidades	Núcleo de gel ultra absorbente, Loción hipoalergénica con Aloe · Procter & Gamble	Paquete económico con 56 pañales descartables Talla M	Nova Salud Lab	38.94	59.90	38	5	L-2026-029	2028-06-30 00:00:00	/media/products/panales-desechables-pampers-premium-care-hipoalergenico-talla-m.jpg	t	2026-10-28 03:01:18.159	2026-11-07 21:51:52.31	8	1
113	775000000102	Alcohol Medicinal 70% con Atomizador Spray 500 ml	Alcohol Etílico 70° GL, Agua Desmineralizada · Registro Sanitario DIGEMID	Frasco ergonómico con gatillo spray atomizador x 500 ml	Nova Salud Lab	5.79	8.90	52	5	L-2026-031	2028-06-30 00:00:00	/media/products/alcohol-medicinal-70-con-atomizador.jpg	t	2026-10-28 03:01:18.171	2026-11-07 21:51:52.318	9	1
114	775000000103	Alcohol en Gel Antibacterial 70° Frasco con Dosificador 500 ml	Etanol 70%, Glicerina vegetal humectante, Carbómero, Emolientes dérmicos	Frasco con bomba dosificadora (pump) x 500 ml	Nova Salud Lab	7.09	10.90	59	5	L-2026-032	2028-06-30 00:00:00	/media/products/alcohol-en-gel-de-70-fco-500-ml.jpg	t	2026-10-28 03:01:18.178	2026-11-07 21:51:52.324	9	1
115	775000000104	Bolsa Térmica de Gel Frío / Calor Nexcare ColdHot 3M Reutilizable	Gel térmico atóxico y biodegradable encapsulado, Funda protectora lavable · 3M Healthcare	Bolsa flexible reutilizable 10 x 26 cm / Con funda protectora	Nova Salud Lab	22.95	35.30	21	5	L-2026-033	2028-06-30 00:00:00	/media/products/bolsa-frio-calor-nexcare.jpg	t	2026-10-28 03:01:18.184	2026-11-07 21:51:52.328	9	1
116	775000000105	Botiquín de Primeros Auxilios Tipo Maletín Portátil Rojo	Lona Oxford 600D impermeable, Cierres reforzados dobles, Asa ergonómica	28 cm x 20 cm x 12 cm / Capacidad expandible para kit de emergencia	Nova Salud Lab	27.89	42.90	28	5	L-2026-034	2028-06-30 00:00:00	/media/products/botiquin-de-tela-portatil-tipo-maletin-rojo-sin-equipar.jpg	t	2026-10-28 03:01:18.191	2026-11-07 21:51:52.333	9	1
117	775000000106	Apósitos Curitas Hansaplast Transpiel Surtidas Caja x 20 unidades	Película de poliuretano transparente microperforada, Compresa no adherente · Beiersdorf	Caja x 20 apósitos en 4 tamaños anatómicos surtidos	Nova Salud Lab	4.23	6.50	35	5	L-2026-035	2028-06-30 00:00:00	/media/products/curitas-transpiel-hansaplast-tamanos-diversos.jpg	t	2026-10-28 03:01:18.196	2026-11-07 21:51:52.337	9	1
118	775000000107	Esparadrapo de Papel 3M Micropore 1530-2 (5 cm x 9.1 m) x 1 Rollo	Fibras de rayón microporoso, Adhesivo acrilato hipoalergénico libre de látex · 3M	Rollo 5 cm de ancho x 9.14 metros de largo (2 pulg x 10 yd)	Nova Salud Lab	12.93	19.90	42	5	L-2026-036	2028-06-30 00:00:00	/media/products/esparadrapo-de-papel-de-5-cm-x-91-m-3m-micropore-1530-2-caja-6-und.jpg	t	2026-10-28 03:01:18.201	2026-11-07 21:51:52.34	9	1
119	775000000108	Esponja de Gasa Quirúrgica Absorbente Alfymedix Sobre x 5 unidades	100% Algodón puro hidrófilo, Esterilización ETO · Alfymedix	Sobre sellado de grado médico x 5 unidades (7.5 x 7.5 cm / 8 pliegues)	Nova Salud Lab	1.56	2.40	49	5	L-2026-037	2028-06-30 00:00:00	/media/products/esponja-de-gasa-absorbente-alfymedix.jpg	t	2026-10-28 03:01:18.209	2026-11-07 21:51:52.344	9	1
120	775000000109	Oxímetro de Pulso Digital para Dedo Finger Pulse Oximeter OLED	Carcasa ABS médica, Sensor óptico infrarrojo, Pantalla OLED bicolor	6 x 3.5 x 3.2 cm / Incluye cordón colgador y manual de usuario	Nova Salud Lab	53.24	81.90	56	5	L-2026-038	2028-06-30 00:00:00	/media/products/finger-pulse-oximeter-oximetro-de-pulso.jpg	t	2026-10-28 03:01:18.215	2026-11-07 21:51:52.347	9	1
121	775000000110	Gasa Estéril Fraccionada 10 cm x 10 cm Sobre x 5 unidades	100% Algodón hidrófilo esterilizado, Tejido regular 20x12 hilos/cm²	Sobre estéril x 5 gasas (10 x 10 cm desplegable)	Nova Salud Lab	1.17	1.80	63	5	L-2026-039	2028-06-30 00:00:00	/media/products/gasa-esteril-10x10cm.jpg	t	2026-10-28 03:01:18.22	2026-11-07 21:51:52.35	9	1
122	775000000111	Glucómetro Digital Accu-Chek Guide Kit Completo con Bluetooth	Unidad electrónica de biosensor electroquímico, Lancetero FastClix/Softclix · Roche Diabetes Care	Kit incluye: Glucómetro Guide, Dispositivo de punción, 10 lancetas, estuche rígido	Nova Salud Lab	101.08	155.50	25	5	L-2026-040	2028-06-30 00:00:00	/media/products/glucometro-accu-chek-guide-kit-con-bluetooth.jpg	t	2026-10-28 03:01:18.226	2026-11-07 21:51:52.353	9	1
123	775000000112	Guantes de Examen de Nitrilo Cranberry Celeste Talla S Caja x 100 unidades	100% Nitrilo sintético sin talco, Libre de látex · Cranberry	Caja dispensadora x 100 guantes ambidiestros / Talla S (Small)	Nova Salud Lab	24.05	37.00	32	5	L-2026-041	2028-06-30 00:00:00	/media/products/guantes-de-nitrilo-cranberry-talla-s-100-unidades.png	t	2026-10-28 03:01:18.233	2026-11-07 21:51:52.357	9	1
104	775000000093	Desitin Máxima Protección Crema para Rozaduras 113 g	Óxido de Zinc 40%, Lanolina, Aceite de hígado de bacalao · Johnson & Johnson	Tubo flexible x 113 g (4 oz) / Máxima eficacia clínica	Nova Salud Lab	25.94	39.90	34	5	L-2026-022	2028-06-30 00:00:00	/media/products/crema-protectora-panal-desitin.jpg	t	2026-10-28 03:01:18.118	2026-11-07 21:51:52.285	8	1
105	775000000094	Mustela Crema Bálsamo 1 2 3 para Rozaduras 100 ml	Perseose de Aguacate, Óxido de Zinc, Oxeoline de Alcácea · Laboratorios Expanscience	Tubo higiénico x 100 ml / 0% perfume, hipoalergénico	Nova Salud Lab	30.49	46.90	41	5	L-2026-023	2028-06-30 00:00:00	/media/products/crema-para-rozaduras-mustela.jpg	t	2026-10-28 03:01:18.123	2026-11-07 21:51:52.289	8	1
106	775000000095	Mustela Gel Limpiador Suave para Bebé 500 ml	Perseose de Aguacate Bio, Vitamina B5, Tensioactivos suaves sin jabón · Mustela	Frasco con válvula dosificadora ergonómica x 500 ml	Nova Salud Lab	44.79	68.90	48	5	L-2026-024	2028-06-30 00:00:00	/media/products/gel-de-bano-suave-mustela.jpg	t	2026-10-28 03:01:18.128	2026-11-07 21:51:52.292	8	1
129	775000000118	Sulfadiazina de Plata 1% Crema Dérmica Genfar Tubo 30 g	Sulfadiazina de Plata Micronizada 10 mg/g  · Genfar / Sanofi	Tubo colapsible de aluminio x 30 g / Aplicación tópica	1%	6.83	10.50	29	5	L-2026-047	2028-06-30 00:00:00	/media/products/sulfadiazina-de-plata-1-crema-genfar-tubo-30-g.jpg	t	2026-10-28 03:01:18.269	2026-11-07 21:51:52.377	9	1
77	775000000066	CeraVe Gel Limpiador Espumoso Piel Normal a Grasa 473 ml	Ceramidas 1, 3, 6-II, Niacinamida, Ácido Hialurónico · L'Oréal CeraVe	Frasco con válvula pump x 473 ml / Fórmula espumosa	Nova Salud Lab	55.19	84.90	24	5	L-2026-035	2028-06-30 00:00:00	/media/products/cerave-gel-limpiador-espumoso-foaming-cleanser-473ml.jpg	t	2026-10-28 03:01:17.974	2026-11-07 21:51:52.189	7	1
87	775000000076	Pack Eucerin DermoPure Sérum Triple Efecto + Gel Limpiador	Thiamidol patentado, Ácido Salicílico 2%, Complejo Licochalcona A · Eucerin	Caja estuche con Sérum 40 ml + Gel Limpiador Clinical 150 ml	Nova Salud Lab	107.19	164.90	50	5	L-2026-045	2028-06-30 00:00:00	/media/products/pack-eucerin-dermopure-serum-corrector-gel-limpiador-clinical-triple-accion.jpg	t	2026-10-28 03:01:18.027	2026-11-07 21:51:52.225	7	1
112	775000000101	Agua Oxigenada 10 Volúmenes Laboratorios Portugal 120 ml	Peróxido de Hidrógeno 3%  · Laboratorios Portugal	Frasco con tapa dosificadora x 120 ml / Uso externo	10 Volúmenes	1.63	2.50	52	5	L-2026-030	2028-06-30 00:00:00	/media/products/agua-oxigenada-10-vol-de-120-ml.jpg	t	2026-10-28 03:01:18.166	2026-11-07 21:51:52.314	9	1
126	775000000115	Mascarilla Quirúrgica Mayfield 3 Pliegues con Filtro Meltblown Celeste Caja x 50 unidades	Polipropileno no tejido  + Filtro Meltblown electrostático · Mayfield	Caja sellada x 50 unidades / Medidas estándar 17.5 x 9.5 cm	Spunbond	16.25	25.00	53	5	L-2026-044	2028-06-30 00:00:00	/media/products/mascarilla-quirurgica-mayfield-3-capas-3-pliegues-celeste-caja-50und.jpg	t	2026-10-28 03:01:18.251	2026-11-07 21:51:52.367	9	1
127	775000000116	Neomicina Sulfato 0.5 g + Bacitracina Zinc 25 000 UI Ungüento Tópico Tubo 15 g	Neomicina Sulfato 5 mg/g, Bacitracina de Zinc 500 UI/g · Genfar / Medifarma	Tubo de aluminio colapsible sellado herméticamente x 15 g	Nova Salud Lab	10.14	15.60	60	5	L-2026-045	2028-06-30 00:00:00	/media/products/neomicina-bacitracina-0500g-25-000-ui-unguento.jpg	t	2026-10-28 03:01:18.257	2026-11-07 21:51:52.37	9	1
130	775000000119	Tensiómetro Digital de Brazo Omron M3 Comfort HEM-7154-E con Manguito Intelli Wrap	Sensor oscilométrico Omron Intellisense, Manguito preformado Intelli Wrap · Omron Healthcare Japón	Kit incluye: Monitor digital, Manguito 22-42 cm, 4 pilas AA, estuche y manual	Nova Salud Lab	328.90	506.00	10	5	L-2026-048	2027-12-31 05:00:00	/media/products/tensiometro-digital-de-brazo-omron-m3-hem-7154e.jpg	t	2026-10-28 03:01:18.275	2026-11-07 21:51:52.38	9	1
31	775000000020	Prednisona IQFarma 20 mg	Prednisona 20 mg	Caja x 100 tabletas (10 blísteres de 10)	IQFARMA	2.08	3.20	63	5	L-2026-029	2028-06-30 00:00:00	/media/products/prednisona-20mg-medifarma.jpg	t	2026-10-28 03:01:17.695	2026-11-07 21:51:52.028	10	1
51	775000000040	Accu-Chek Instant Kit Glucómetro Digital Roche	Medidor de glucosa Accu-Chek Instant + Dispositivo de punción + Tiras reactivas	Caja Kit completo (Medidor + Lancetero + Estuche)	Roche	55.19	84.90	22	5	L-2026-049	2028-06-30 00:00:00	/media/products/accu-chek-instant-kit-roche.jpg	t	2026-10-28 03:01:17.833	2026-11-07 21:51:52.098	5	1
53	775000000042	Neurobión 5000 Vía Oral (60 Tabletas)	Tiamina  100 mg, Piridoxina (Vit. B6) 100 mg, Cianocobalamina (Vit. B12) 5000 mcg (P&G Health)	Caja x 60 tabletas recubiertas (6 blísteres de 10)	Vit. B1	13.65	21.00	37	5	L-2026-011	2028-06-30 00:00:00	/media/products/neurobion-5000-inyectable-x3.jpg	t	2026-10-28 03:01:17.845	2026-11-07 21:51:52.104	6	1
68	775000000057	Nature's Bounty Cranberry 4200 mg with Vitamin C (120 Softgels)	Concentrado de Vaccinium macrocarpon  equivalente a 4200 mg + Vitamina C (Nature's Bounty USA)	Frasco x 120 cápsulas blandas (softgels)	Cranberry	61.69	94.90	51	5	L-2026-026	2028-06-30 00:00:00	/media/products/cranberry-concentrado-mason.jpg	t	2026-10-28 03:01:17.93	2026-11-07 21:51:52.158	6	1
101	775000000090	Aero-OM Pediátrico Gotas Sabor Fresa 100 mg / ml 15 ml	Simeticona 100 mg/ml, Suspensión homogénea sabor fresa · OM Pharma	Frasco gotero con cuentagotas integrado x 15 ml	Nova Salud Lab	9.49	14.60	55	5	L-2026-019	2028-06-30 00:00:00	/media/products/aero-om-100mg-ml-suspension-gotas-sabor-fresa-frasco-15-ml.jpg	t	2026-10-28 03:01:18.102	2026-11-07 21:51:52.275	8	1
124	775000000113	Jeringa Descartable 5 ml con Aguja 21G x 1 1/2 Pulgada Nipro / Bbraun	Polipropileno de grado médico, Aguja de acero inoxidable quirúrgico siliconada	Capacidad 5 ml / Aguja 21G x 1 1/2 pulg (0.8 x 38 mm)	Nova Salud Lab	0.33	0.50	39	5	L-2026-042	2028-06-30 00:00:00	/media/products/jeringa-descartable-5ml-c-a-21g-x1-12-und.jpg	t	2026-10-28 03:01:18.238	2026-11-07 21:51:52.36	9	1
125	775000000114	Jeringas para Insulina BD Ultra-Fine 0.3 ml con Aguja 31G x 6 mm Bolsa x 10 unidades	Polipropileno médico transparente, Aguja quirúrgica 31G ultrafina · BD	Bolsa x 10 jeringas individuales estériles de 0.3 ml (escala U-100)	Becton Dickinson	4.88	7.50	46	5	L-2026-043	2028-06-30 00:00:00	/media/products/jeringa-descartable-de-insulina-bd-03ml-aguja31-bolsa-10-un.jpg	t	2026-10-28 03:01:18.244	2026-11-07 21:51:52.364	9	1
128	775000000117	Plasyodine Bucal 10% Solución Tópica y Enjuague Antiséptico Frasco 120 ml	Povidona Yodada 10 g / 100 ml  · Laboratorio Bagó / Farmaindustria	Frasco con vaso dosificador x 120 ml / Vía tópica bucal	1% Yodo activo	28.02	43.10	22	5	L-2026-046	2028-06-30 00:00:00	/media/products/plasyodine-bucal-10-soucion-topica.jpg	t	2026-10-28 03:01:18.263	2026-11-07 21:51:52.373	9	1
131	775000000120	Venda Elástica de Compresión 4 Pulgadas x 5 Yardas con Ganchos de Sujeción	65% Algodón, 35% Fibras elásticas de poliamida hipoalergénicas · Laboratorios Portugal	Rollo envuelto en celofán 4 pulg x 5 yardas (10 cm x 4.5 m estirada)	Nova Salud Lab	2.93	4.50	43	5	L-2026-049	2028-06-30 00:00:00	/media/products/venda-elastica-4-x-5-yardas.jpg	t	2026-10-28 03:01:18.281	2026-11-07 21:51:52.383	9	1
\.


--
-- Data for Name: Proveedor; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Proveedor" (id, ruc, "razonSocial", telefono, contacto, activo) FROM stdin;
1	20100055231	Distribuidora Farmacéutica del Perú S.A.C.	01-4458920	Ing. Químico Farmacéutico Responsable	t
\.


--
-- Data for Name: Usuario; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Usuario" (id, nombre, email, password, rol, activo, "createdAt", "updatedAt", avatar, telefono) FROM stdin;
1	Administrador Nova Salud	admin@novasalud.com	$2b$10$hFcPW7E8YlsT9tGB.RW6s.V.dvj1.VEvW.qzY8EhFxq4vxaXH6DH6	ADMIN	t	2026-10-21 21:56:42.224	2026-11-07 21:51:51.842	/avatars/admin/admin-3.jpg	
2	Carla Ramos (Cajero)	cajero@novasalud.com	$2b$10$B0wWKSykXJREo1uNRi4n1ednxnmy/OTL8VoXhgLTsXAuJ0ZYh/r7K	CAJERO	t	2026-10-21 21:56:42.238	2026-11-07 21:51:51.85	/avatars/cajero/cajero-2.jpg	
3	Gestor de Almacén & Kardex	almacen@novasalud.com	$2b$10$81YcBKhyS5lFAyNdysU2Bu0GMtZnO11ciK6sLa02rwYqCAO1pmkjW	ALMACEN	t	2026-10-28 02:30:35.353	2026-11-07 21:51:51.852	/avatars/almacen/almacen-2.jpg	
\.


--
-- Data for Name: Venta; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Venta" (id, total, "metodoPago", "clienteDoc", "clienteNom", "createdAt", "usuarioId") FROM stdin;
13	84.90	EFECTIVO	76880921	KLEVERD GABRIEL APAZA QUISPE	2026-10-31 19:34:58.164	1
14	9.60	EFECTIVO	76880921	KLEVERD GABRIEL APAZA QUISPE	2026-10-31 19:52:53.763	1
15	14.60	EFECTIVO	\N	Cliente General	2026-10-31 19:59:35.938	1
16	7.50	EFECTIVO	76880921	KLEVERD GABRIEL APAZA QUISPE	2026-10-31 22:24:56.939	1
17	35.00	EFECTIVO	76880921	KLEVERD GABRIEL APAZA QUISPE	2026-10-31 22:26:24.177	1
18	29.20	EFECTIVO	76880921	KLEVERD GABRIEL APAZA QUISPE	2026-11-06 02:06:45.808	2
19	94.90	EFECTIVO	76880922	DANIEL SINCHI MAMANI	2026-11-06 19:24:15.842	2
20	1.30	TARJETA	76880923	SANCHEZ HUAMAN, ANA PATRICIA	2026-11-06 19:25:27.366	2
21	2.40	YAPE_PLIN	76880921	Keverd Apaza Quispe [Web Delivery - Lima Cercado]	2026-11-07 01:27:46.686	1
22	11.70	TARJETA	76880921	Keverd Apaza Quispe [Web Delivery - Lima Cercado]	2026-11-07 01:31:54.683	1
23	259.80	TARJETA	76880921	Keverd Apaza Quispe [Web Delivery - Los Olivos]	2026-11-07 01:41:27.717	1
24	84.90	TARJETA	76880921	Keverd Apaza Quispe [Web Delivery - Los Olivos]	2026-11-07 01:51:30.374	1
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b517c273-9e80-43d5-ba97-bcabd072cc95	17dd7cf929424a701bf7390674cb2440d32b405e381e603160e01b8273021b36	2026-10-21 16:56:29.549706-05	20261021215629_init_fase1	\N	\N	2026-10-21 16:56:29.414703-05	1
\.


--
-- Name: Categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Categoria_id_seq"', 33, true);


--
-- Name: Cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Cliente_id_seq"', 2, true);


--
-- Name: DetalleVenta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."DetalleVenta_id_seq"', 26, true);


--
-- Name: MovimientoInventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."MovimientoInventario_id_seq"', 154, true);


--
-- Name: Producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Producto_id_seq"', 131, true);


--
-- Name: Proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Proveedor_id_seq"', 4, true);


--
-- Name: Usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Usuario_id_seq"', 9, true);


--
-- Name: Venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Venta_id_seq"', 24, true);


--
-- Name: Categoria Categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Categoria"
    ADD CONSTRAINT "Categoria_pkey" PRIMARY KEY (id);


--
-- Name: Cliente Cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cliente"
    ADD CONSTRAINT "Cliente_pkey" PRIMARY KEY (id);


--
-- Name: DetalleVenta DetalleVenta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DetalleVenta"
    ADD CONSTRAINT "DetalleVenta_pkey" PRIMARY KEY (id);


--
-- Name: MovimientoInventario MovimientoInventario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovimientoInventario"
    ADD CONSTRAINT "MovimientoInventario_pkey" PRIMARY KEY (id);


--
-- Name: Producto Producto_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Producto"
    ADD CONSTRAINT "Producto_pkey" PRIMARY KEY (id);


--
-- Name: Proveedor Proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Proveedor"
    ADD CONSTRAINT "Proveedor_pkey" PRIMARY KEY (id);


--
-- Name: Usuario Usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Usuario"
    ADD CONSTRAINT "Usuario_pkey" PRIMARY KEY (id);


--
-- Name: Venta Venta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Venta"
    ADD CONSTRAINT "Venta_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Categoria_nombre_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Categoria_nombre_key" ON public."Categoria" USING btree (nombre);


--
-- Name: Cliente_dni_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cliente_dni_key" ON public."Cliente" USING btree (dni);


--
-- Name: Cliente_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Cliente_email_key" ON public."Cliente" USING btree (email);


--
-- Name: Producto_codigoBarras_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON public."Producto" USING btree ("codigoBarras");


--
-- Name: Proveedor_ruc_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Proveedor_ruc_key" ON public."Proveedor" USING btree (ruc);


--
-- Name: Usuario_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Usuario_email_key" ON public."Usuario" USING btree (email);


--
-- Name: DetalleVenta DetalleVenta_productoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DetalleVenta"
    ADD CONSTRAINT "DetalleVenta_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES public."Producto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DetalleVenta DetalleVenta_ventaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DetalleVenta"
    ADD CONSTRAINT "DetalleVenta_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES public."Venta"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MovimientoInventario MovimientoInventario_productoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovimientoInventario"
    ADD CONSTRAINT "MovimientoInventario_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES public."Producto"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MovimientoInventario MovimientoInventario_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MovimientoInventario"
    ADD CONSTRAINT "MovimientoInventario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Producto Producto_categoriaId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Producto"
    ADD CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES public."Categoria"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Producto Producto_proveedorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Producto"
    ADD CONSTRAINT "Producto_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES public."Proveedor"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Venta Venta_usuarioId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Venta"
    ADD CONSTRAINT "Venta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES public."Usuario"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--




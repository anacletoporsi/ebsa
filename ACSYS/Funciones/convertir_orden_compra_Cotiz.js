presupuesto = zoho.crm.getRecordById("Cotizaciones_Actual",recordId);
//info "presupuesto" + presupuesto;
mensaje = "Orden de Compra creada.";
response = invokeurl
[
	url :"https://www.zohoapis.com/crm/v2.1/Cotizaciones_Actual/" + recordId
	type :GET
	connection:"zoho_crm"
];
info "response " + response;
//trae del presupuesto 
detalleProducto = response.get("data").get(0).get("Articulos1");
//lista Productos
productList = List();
auxOC = 0;
for each  product in detalleProducto
{
	if(product.get("OC") == true)
	{
		//moneda = product.get("product").get("Currency");
		sku = product.get("SKU");
		nombreProducto = product.get("Descripcion").get("name");
		id = product.get("Descripcion").get("id");
		fullProducto = zoho.crm.getRecordById("Products",id);
		//	info "fullProducto: " + fullProducto;
		cantidad = product.get("Unidades");
		descripcion = fullProducto.get("Description");
		precioLista = product.get("Costo");
		// array Productos
		paramsProduct = Map();
		paramsProduct.put("SKU",sku);
		paramsProduct.put("Product_Name",id);
		paramsProduct.put("Quantity",cantidad);
		paramsProduct.put("Description",descripcion);
		paramsProduct.put("List_Price",precioLista);
		productValue = ifNull(product.get("Impuesto"),0);
		paramsProduct.put("Tax",productValue);
		taxList = List();
		taxMap = Map();
		taxMap.put("percentage",productValue);
		taxMap.put("name","IVA");
		taxMap.put("id","5676260000000419487");
		taxMap.put("value",productValue);
		taxList.add(taxMap);
		if(productValue != 0)
		{
			paramsProduct.put("Line_Tax",taxList);
		}
		info "taxList";
		info taxList;
		/*paramsProduct.put("unit_price",precioUnitario);
        paramsProduct.put("Total_imp",auxiliarImp);*/
		productList.add(paramsProduct);
		auxOC = auxOC + 1;
	}
}
if(auxOC == 0)
{
	mensaje = "Debe marcar los items que se incluiran en la OC.";
}
else
{
	terminosCondiciones = presupuesto.get("T_rminos_y_condiciones");
	asunto = presupuesto.get("Asunto");
	cuentaName = ifNull(presupuesto.get("Nombre_de_Cuenta").get("id"),"");
	contactName = ifNull(presupuesto.get("Nombre_de_Contacto").get("id"),"");
	quoteName = ifNull(presupuesto.get("id"),"");
	fechaVencimiento = response.get("data").get(0).get("Valid_Till");
	quoteNumber = presupuesto.get("Presupuesto_N");
	condicionPago = presupuesto.get("Condici_n_de_pago");
	fechaOrden = zoho.currentdate.text("yyyy-MM-dd");
	propietario = presupuesto.get("Owner").get("id");
	// array general para todo.
	paramsMap = Map();
	//agregado 
	paramsMap.put("Condici_n_de_pago",presupuesto.get("T_rminos_y_condiciones"));
	//toc
	//paramsMap.put("Forma_de_pago",);//toc
	//en agregado
	paramsMap.put("Subject",asunto);
	//toc
	paramsMap.put("Terms_and_Conditions",terminosCondiciones);
	// toc
	paramsMap.put("Contact_Name",contactName);
	//toc
	paramsMap.put("Status","Creada");
	//toc
	paramsMap.put("PO_Date",fechaOrden);
	//toc
	paramsMap.put("Purchase_Items",productList);
	// modificar su productList
	paramsMap.put("Due_Date",fechaVencimiento);
	//toc
	//paramsMap.put("Nombre_de_Cotizacion",recordId);
	paramsMap.put("Quote_N",quoteNumber);
	//toc
	//paramsMap.put("Owner", propietario);
	paramsMap.put("Condici_n_de_pago",condicionPago);
	paramsMap.put("Cotizaci_n",recordId);
	//toc
	//info "paramsMap " + paramsMap;
	//info zoho.crm.createRecord("Sales_Orders",paramsMap);
	//via api
	dataList = List();
	dataList.add(paramsMap);
	jsonData = Map();
	jsonData.put("data",dataList);
	createRecordApi = invokeurl
	[
		url :"https://www.zohoapis.com/crm/v2.1/Purchase_Orders"
		type :POST
		parameters:jsonData.toString()
		connection:"zoho_crm"
	];
	info "createRecordApi: " + createRecordApi;
	exec = createRecordApi.get("data").get(0).get("code");
	if(exec == "SUCCESS")
	{
		mensaje = "Orden de compra generada con éxito.";
	}
	else
	{
		mensaje = "Ocurrió un error al momento de generar la Orden de compra. Comuníquese con el Admin.";
	}
}
return mensaje;

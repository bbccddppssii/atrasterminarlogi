export default function transformUpdateEstudiante(data : any) : any {
    const transformedData : any = { $set: {} };
    for (const key in data) {
      if (key === "datosPersonales") {
        for (const innerKey in data[key]) {
          transformedData.$set[`datosPersonales.${innerKey}`] = data[key][innerKey];
        }
      } else {
        transformedData.$set[key] = data[key];
      }
    }
    return transformedData;
  }
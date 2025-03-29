import { getSupabaseServer } from "@/lib/supabase"

export async function initializeStorage(): Promise<boolean> {
  try {
    const supabase = getSupabaseServer()

    // Verificar si el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("Error al listar buckets:", bucketsError)
      return false
    }

    // Crear bucket para imágenes si no existe
    if (!buckets.some((bucket) => bucket.name === "images")) {
      const { error: createError } = await supabase.storage.createBucket("images", {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      })

      if (createError) {
        console.error("Error al crear bucket de imágenes:", createError)
        return false
      }

      // Establecer política de acceso público
      const { error: policyError } = await supabase.storage.from("images").createSignedUrl("dummy.txt", 1)
      console.log("Bucket de imágenes creado correctamente")
    }

    // Crear bucket para archivos si no existe
    if (!buckets.some((bucket) => bucket.name === "files")) {
      const { error: createError } = await supabase.storage.createBucket("files", {
        public: true,
        fileSizeLimit: 20971520, // 20MB
      })

      if (createError) {
        console.error("Error al crear bucket de archivos:", createError)
        return false
      }

      // Establecer política de acceso público
      const { error: policyError } = await supabase.storage.from("files").createSignedUrl("dummy.txt", 1)
      console.log("Bucket de archivos creado correctamente")
    }

    return true
  } catch (error) {
    console.error("Error al inicializar almacenamiento:", error)
    return false
  }
}

export async function uploadImage(image: File, bucketName = "images", folder = "uploads"): Promise<string | null> {
  try {
    const supabase = getSupabaseServer()

    const timestamp = new Date().getTime()
    const imageName = `${timestamp}-${image.name}`
    const imagePath = `${folder}/${imageName}`

    const { error } = await supabase.storage.from(bucketName).upload(imagePath, image, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error al subir la imagen:", error)
      return null
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(imagePath)
    return data.publicUrl
  } catch (error) {
    console.error("Error al procesar la subida de la imagen:", error)
    return null
  }
}

export async function uploadFile(file: File, bucketName = "files", folder = "uploads"): Promise<string | null> {
  try {
    const supabase = getSupabaseServer()

    const timestamp = new Date().getTime()
    const fileName = `${timestamp}-${file.name}`
    const filePath = `${folder}/${fileName}`

    const { error } = await supabase.storage.from(bucketName).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Error al subir el archivo:", error)
      return null
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
    return data.publicUrl
  } catch (error) {
    console.error("Error al procesar la subida del archivo:", error)
    return null
  }
}

export async function deleteFileByUrl(fileUrl: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServer()

    // Extract bucket and path from URL
    const urlParts = fileUrl.split("/")
    const bucketName = urlParts[urlParts.findIndex((part) => part === "files" || part === "images") - 1]
    const filePath = urlParts.slice(urlParts.findIndex((part) => part === "files" || part === "images")).join("/")

    const { error } = await supabase.storage.from(bucketName).remove([filePath])

    if (error) {
      console.error("Error al eliminar el archivo:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error al procesar la eliminación del archivo:", error)
    return false
  }
}

export async function listFiles(bucketName: string, folder: string): Promise<string[] | null> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase.storage.from(bucketName).list(folder)

    if (error) {
      console.error("Error al listar archivos:", error)
      return null
    }

    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + "/storage/v1/object/public/" + bucketName + "/"

    const fileUrls = data.map((file) => baseUrl + folder + "/" + file.name)
    return fileUrls
  } catch (error) {
    console.error("Error al procesar la lista de archivos:", error)
    return null
  }
}


import {z} from 'zod'

const personalInfoSchema=z.object({
    firstNamme: z.string()
        .min(2,"First name must be atlteast 2 characters")
        .max(50,"First name too long")
        .regex(/^[A-Za-z\s]+$/,"use only letters and spaces"),
        
    LastName: z.string()
        .min(2,"Last name too short")
        .max(50,"last name too long")
        .regex(/^[A-Za-z\s/]+$/," use only letters and spaces"),

    dateOfBirth : z.string()
         .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
          .refine((date) => {
                const age = new Date().getFullYear() - new Date(date).getFullYear();
                return age >= 18 && age <= 65;
            }, 'Age must be between 18 and 65'),

     gender:    z.enum(['male','female','other','prefer-not-to-say'])

     
     



    })
# Proyecto

Proyecto de volquetas

I decided to merge part 1 and part 2 in only one page as suggested.

I used SASS as a preprocessor, files can be seen in `/css/sass`

## Things I couldn't resolve

In the Desktop Mockup letters appear to be a little bit more stretched than in the page I made.

I've tried using the css font property font-stretch and font weight but it didn't work.

## Resolutions

I've made 3 working resolutions:

- Desktop for screens with wider width than `1300px`
- Tablet for screens with widths between `768px` and `1300px`
- Mobile for screens with widths smaller than `768px`

## Author

- Gianluca Cavajani - cavajanig@gmail.com

## Referencia de la API

#### Get todos los usuarios

```http
  GET /api/usuarios
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `api_key` | `string` | **Required**. Your API key |

#### Get item

```http
  GET /api/items/${id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. Id of item to fetch |

#### add(num1, num2)

Takes two numbers and returns the sum.

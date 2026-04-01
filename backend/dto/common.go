package dto

type SuccessResponse[T any] struct {
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type ErrorResponse struct {
	Errors []string `json:"errors"`
}

type ListRequest[T any] struct {
	Limit   int `json:"limit"`
	Page    int `json:"page"`
	Filters T   `json:"filters"`
}

type PaginationMeta struct {
	Page    int   `json:"page"`
	Limit   int   `json:"limit"`
	Total   int64 `json:"total"`
	HasMore bool  `json:"has_more"`
	HasPrev bool  `json:"has_prev"`
}

type PaginatedResponse[T any] struct {
	Data       []T            `json:"data"`
	Pagination PaginationMeta `json:"pagination"`
}
